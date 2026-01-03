'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PartyPhoto } from '@/lib/types'
import Image from 'next/image'

interface PhotoGalleryProps {
  partyId: string
  partySlug: string
  canManage: boolean
}

export default function PhotoGallery({ partyId, partySlug, canManage }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<PartyPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploaderName, setUploaderName] = useState('')
  const [uploaderEmail, setUploaderEmail] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<PartyPhoto | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadPhotos()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`party_photos:${partyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'party_photos',
          filter: `party_id=eq.${partyId}`,
        },
        () => {
          loadPhotos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [partyId])

  const loadPhotos = async () => {
    const { data } = await supabase
      .from('party_photos')
      .select('*')
      .eq('party_id', partyId)
      .order('created_at', { ascending: false })

    if (data) {
      setPhotos(data)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (!uploaderName.trim()) {
      alert('Please enter your name')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    const totalFiles = files.length
    let uploadedCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${partySlug}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      try {
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('party-photos')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('party-photos')
          .getPublicUrl(fileName)

        // Save metadata to database
        await supabase.from('party_photos').insert({
          party_id: partyId,
          uploaded_by_name: uploaderName,
          uploaded_by_email: uploaderEmail || null,
          file_path: fileName,
          file_name: file.name,
        })

        uploadedCount++
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100))
      } catch (err) {
        console.error('Error uploading file:', err)
      }
    }

    setUploading(false)
    setUploadProgress(0)
    setShowUploadForm(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (photo: PartyPhoto) => {
    if (!confirm('Delete this photo?')) return

    // Delete from storage
    await supabase.storage.from('party-photos').remove([photo.file_path])

    // Delete from database
    await supabase.from('party_photos').delete().eq('id', photo.id)
  }

  const getPhotoUrl = (filePath: string) => {
    const { data } = supabase.storage.from('party-photos').getPublicUrl(filePath)
    return data.publicUrl
  }

  const uploadUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/party/${partySlug}/photos`

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📸 Photo Gallery</h2>
          <p className="text-sm text-gray-500 mt-1">{photos.length} photos</p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
        >
          {showUploadForm ? 'Cancel' : '+ Upload Photos'}
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Email (optional)
              </label>
              <input
                type="email"
                value={uploaderEmail}
                onChange={(e) => setUploaderEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Photos
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              />
            </div>

            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> You can select multiple photos at once. Share this link for easy uploads: <br />
              <a href={uploadUrl} className="underline break-all">{uploadUrl}</a>
            </p>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-gray-500">No photos yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <Image
                src={getPhotoUrl(photo.file_path)}
                alt={photo.file_name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-end p-3">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-full">
                  <p className="text-xs font-semibold truncate">{photo.uploaded_by_name}</p>
                  {canManage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(photo)
                      }}
                      className="mt-2 text-xs bg-red-500 px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            >
              ×
            </button>
            <div className="relative w-full h-full">
              <Image
                src={getPhotoUrl(selectedPhoto.file_path)}
                alt={selectedPhoto.file_name}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 p-4 rounded-lg">
              <p className="text-white font-semibold">{selectedPhoto.uploaded_by_name}</p>
              <p className="text-gray-300 text-sm">
                {new Date(selectedPhoto.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
