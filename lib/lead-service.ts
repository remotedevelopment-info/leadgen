import { getDatabase } from "./database"
import type { Lead, LeadStatus, SearchFilters, LeadStats, Activity } from "./types"

export class LeadService {
  private static instance: LeadService
  private db = getDatabase()

  private constructor() {}

  static getInstance(): LeadService {
    if (!LeadService.instance) {
      LeadService.instance = new LeadService()
    }
    return LeadService.instance
  }

  // Lead operations
  getAllLeads(): Lead[] {
    return this.db.getAllLeads()
  }

  getLeadById(id: string): Lead | null {
    return this.db.getLeadById(id)
  }

  getLeadsByStatus(status: LeadStatus): Lead[] {
    return this.db.getLeadsByStatus(status)
  }

  searchLeads(filters: SearchFilters): Lead[] {
    return this.db.searchLeads(filters)
  }

  createLead(lead: Omit<Lead, "id" | "created_at" | "updated_at">): Lead {
    return this.db.createLead(lead)
  }

  updateLeadStatus(id: string, status: LeadStatus): boolean {
    const success = this.db.updateLeadStatus(id, status)

    if (success) {
      // Track activity
      let description = `Status changed to ${status}`
      if (status === "contacted") {
        description = "Lead contacted via email/phone"
      } else if (status === "replied") {
        description = "Lead replied to outreach"
      } else if (status === "converted") {
        description = "Lead converted to customer"
      }

      this.db.addActivity(id, "status_change", description)
    }

    return success
  }

  // Activity operations
  getActivitiesForLead(leadId: string): Activity[] {
    return this.db.getActivitiesForLead(leadId)
  }

  addActivity(leadId: string, type: string, description: string): void {
    this.db.addActivity(leadId, type, description)
  }

  // Analytics
  getStats(): LeadStats {
    return this.db.getLeadStats()
  }

  // Dynamic filter options based on current data
  getAvailableFilterOptions() {
    const leads = this.getAllLeads()

    const industries = [...new Set(leads.map((l) => l.industry))].filter(Boolean)
    const businessTypes = [...new Set(leads.map((l) => l.business_type))].filter(Boolean)
    const cities = [...new Set(leads.map((l) => l.city))].filter(Boolean)
    const states = [...new Set(leads.map((l) => l.state))].filter(Boolean)

    return {
      industries,
      businessTypes,
      cities,
      states,
      employeeRanges: ["1-10", "11-50", "51-200", "201-500", "500+"],
      revenueRanges: ["<$1M", "$1M-$5M", "$5M-$25M", "$25M-$100M", "$100M+"],
    }
  }
}
