export interface Lead {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  state: string
  zip_code: string
  country?: string
  industry: string
  business_type: string
  employee_count: number
  annual_revenue: number
  description: string
  rating: number // 1-10 scale for lead quality
  score: number // Calculated lead score
  status: "prospect" | "contacted" | "replied" | "converted" | "rejected"
  source: "google_maps" | "manual" | "import"
  contacted_at?: string
  replied_at?: string
  created_at: string
  updated_at: string
}

export type LeadStatus = Lead["status"]

export interface Activity {
  id: string
  lead_id: string
  type: string
  description: string
  created_at: string
}

export interface SearchFilters {
  industries?: string[]
  businessTypes?: string[]
  employeeRanges?: string[]
  revenueRanges?: string[]
  locations?: string[]
  minRating?: number
  searchTerm?: string
}

export interface LeadStats {
  total: number
  prospects: number
  contacted: number
  replied: number
  averageScore: number
}
