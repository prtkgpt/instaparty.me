'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PotluckItem } from '@/lib/types'

interface PotluckListProps {
  partyId: string
  isOwner: boolean
}

export default function PotluckList({ partyId, isOwner }: PotluckListProps) {
  const [items, setItems] = useState<PotluckItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadItems()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`potluck_items:${partyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'potluck_items',
          filter: `party_id=eq.${partyId}`,
        },
        () => {
          loadItems()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [partyId])

  const loadItems = async () => {
    const { data } = await supabase
      .from('potluck_items')
      .select('*')
      .eq('party_id', partyId)
      .order('created_at', { ascending: true })

    if (data) {
      setItems(data)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { error } = await supabase
      .from('potluck_items')
      .insert({
        party_id: partyId,
        item_name: itemName,
        category: category || null,
        quantity: parseInt(quantity),
        notes: notes || null,
      })

    if (!error) {
      setItemName('')
      setCategory('')
      setQuantity('1')
      setNotes('')
      setShowAddForm(false)
    }

    setSubmitting(false)
  }

  const handleClaim = async (itemId: string) => {
    const name = prompt('Enter your name:')
    if (!name) return

    const email = prompt('Enter your email (optional):') || null

    await supabase
      .from('potluck_items')
      .update({
        claimed_by_name: name,
        claimed_by_email: email,
      })
      .eq('id', itemId)
  }

  const handleUnclaim = async (itemId: string) => {
    if (!confirm('Remove your claim on this item?')) return

    await supabase
      .from('potluck_items')
      .update({
        claimed_by_name: null,
        claimed_by_email: null,
      })
      .eq('id', itemId)
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this item?')) return

    await supabase
      .from('potluck_items')
      .delete()
      .eq('id', itemId)
  }

  const categories = ['Main Dish', 'Side Dish', 'Appetizer', 'Dessert', 'Drinks', 'Other']

  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || 'Uncategorized'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, PotluckItem[]>)

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🍽️ Potluck Sign-up</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
        >
          {showAddForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <form onSubmit={handleAddItem} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Pasta Salad"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity/Servings
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Vegetarian, Gluten-free"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
            >
              {submitting ? 'Adding...' : 'Add to List'}
            </button>
          </div>
        </form>
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No items yet. Be the first to add something to bring!
        </p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([cat, catItems]) => (
            <div key={cat}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{cat}</h3>
              <div className="space-y-2">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg ${
                      item.claimed_by_name
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                          {item.quantity > 1 && (
                            <span className="text-sm text-gray-500">({item.quantity})</span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                        )}
                        {item.claimed_by_name && (
                          <p className="text-sm text-green-700 mt-2">
                            ✓ Claimed by <span className="font-medium">{item.claimed_by_name}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {!item.claimed_by_name ? (
                          <button
                            onClick={() => handleClaim(item.id)}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            I'll Bring This
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnclaim(item.id)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Unclaim
                          </button>
                        )}
                        {isOwner && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
