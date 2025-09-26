import type { Lead, SearchFilters, LeadStats } from "./types"
import { mockLeads } from "./mock-data"

const STORAGE_KEY = "lead-generation-data"

export class LeadStorage {
  private static instance: LeadStorage
  private leads: Lead[] = []

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): LeadStorage {
    if (!LeadStorage.instance) {
      LeadStorage.instance = new LeadStorage()
    }
    return LeadStorage.instance
  }

  private loadFromStorage(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.leads = JSON.parse(stored)
      } else {
        // Initialize with mock data
        this.leads = mockLeads
        this.saveToStorage()
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.leads))
    }
  }

  getAllLeads(): Lead[] {
    return this.leads
  }

  getLeadsByStatus(status: Lead["status"]): Lead[] {
    return this.leads.filter((lead) => lead.status === status)
  }

  addLead(lead: Omit<Lead, "id" | "createdAt" | "updatedAt">): Lead {
    const newLead: Lead = {
      ...lead,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.leads.push(newLead)
    this.saveToStorage()
    return newLead
  }

  updateLead(id: string, updates: Partial<Lead>): Lead | null {
    const index = this.leads.findIndex((lead) => lead.id === id)
    if (index === -1) return null

    this.leads[index] = {
      ...this.leads[index],
      ...updates,
      updatedAt: new Date(),
    }
    this.saveToStorage()
    return this.leads[index]
  }

  deleteLead(id: string): boolean {
    const index = this.leads.findIndex((lead) => lead.id === id)
    if (index === -1) return false

    this.leads.splice(index, 1)
    this.saveToStorage()
    return true
  }

  searchLeads(filters: Partial<SearchFilters>): Lead[] {
    return this.leads.filter((lead) => {
      // Industry filter
      if (filters.industry?.length && !filters.industry.includes(lead.industry)) {
        return false
      }

      // Business type filter
      if (filters.businessType?.length && !filters.businessType.includes(lead.businessType)) {
        return false
      }

      // Employee count filter
      if (filters.employeeCount?.length && !filters.employeeCount.includes(lead.employeeCount)) {
        return false
      }

      // Revenue filter
      if (filters.revenue?.length && !filters.revenue.includes(lead.revenue)) {
        return false
      }

      // Location filter
      if (filters.location?.city && !lead.city.toLowerCase().includes(filters.location.city.toLowerCase())) {
        return false
      }
      if (filters.location?.state && lead.state !== filters.location.state) {
        return false
      }

      // Rating filter
      if (filters.rating?.min && lead.rating < filters.rating.min) {
        return false
      }
      if (filters.rating?.max && lead.rating > filters.rating.max) {
        return false
      }

      // Keywords filter
      if (filters.keywords?.length) {
        const searchText =
          `${lead.companyName} ${lead.contactName} ${lead.description} ${lead.tags.join(" ")}`.toLowerCase()
        const hasKeyword = filters.keywords.some((keyword) => searchText.includes(keyword.toLowerCase()))
        if (!hasKeyword) return false
      }

      return true
    })
  }

  getStats(): LeadStats {
    const totalLeads = this.leads.length
    const prospects = this.leads.filter((l) => l.status === "prospect").length
    const contacted = this.leads.filter((l) => l.status === "contacted").length
    const replied = this.leads.filter((l) => l.status === "replied").length
    const converted = this.leads.filter((l) => l.status === "converted").length
    const averageRating = this.leads.reduce((sum, lead) => sum + lead.rating, 0) / totalLeads

    return {
      totalLeads,
      prospects,
      contacted,
      replied,
      converted,
      averageRating: Math.round(averageRating * 10) / 10,
    }
  }

  // Simulate Google Maps data mining for dynamic filter options
  getAvailableFilterOptions() {
    const industries = [...new Set(this.leads.map((l) => l.industry))]
    const businessTypes = [...new Set(this.leads.map((l) => l.businessType))]
    const cities = [...new Set(this.leads.map((l) => l.city))]
    const states = [...new Set(this.leads.map((l) => l.state))]
    const tags = [...new Set(this.leads.flatMap((l) => l.tags))]

    return {
      industries,
      businessTypes,
      cities,
      states,
      tags,
    }
  }
}
