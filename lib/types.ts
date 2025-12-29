export interface Party {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  title: string
  description: string | null
  date: string
  location: string | null
  image_url: string | null
  slug: string
  max_guests: number | null
  is_public: boolean
  theme: string
  has_potluck: boolean
}

export type RSVPStatus = 'pending' | 'yes' | 'no' | 'maybe'

export interface Invite {
  id: string
  created_at: string
  updated_at: string
  party_id: string
  name: string
  email: string | null
  phone: string | null
  status: RSVPStatus
  message: string | null
  plus_ones: number
}

export interface Profile {
  id: string
  created_at: string
  updated_at: string
  full_name: string | null
  avatar_url: string | null
}

export interface PartyComment {
  id: string
  created_at: string
  party_id: string
  name: string
  message: string
  is_approved: boolean
}

export interface PotluckItem {
  id: string
  created_at: string
  party_id: string
  item_name: string
  category: string | null
  claimed_by_name: string | null
  claimed_by_email: string | null
  quantity: number
  notes: string | null
}

export interface PartyWithInvites extends Party {
  invites?: Invite[]
  profiles?: Profile
}
