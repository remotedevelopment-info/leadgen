"use client"

import { useState, useEffect } from "react"
import { LeadSearchFilters } from "@/components/lead-search-filters"
import { LeadSearchResults } from "@/components/lead-search-results"
import { LeadStatsOverview } from "@/components/lead-stats-overview"
import { LeadManagementTabs } from "@/components/lead-management-tabs"
import { LeadAnalyticsDashboard } from "@/components/lead-analytics-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users, BarChart3 } from "lucide-react"
import { LeadService } from "@/lib/lead-service"
import { LeadScoringEngine } from "@/lib/lead-scoring"
import type { Lead, SearchFilters, LeadStats } from "@/lib/types"

export default function LeadGenerationDashboard() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({})
  const [searchResults, setSearchResults] = useState<Lead[]>([])
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    prospects: 0,
    contacted: 0,
    replied: 0,
    averageScore: 0,
  })

  const leadService = LeadService.getInstance()
  const scoringEngine = LeadScoringEngine.getInstance()

  // Load initial data
  useEffect(() => {
    const leads = leadService.getAllLeads()
    setAllLeads(leads)
    setSearchResults(leads)
    setStats(leadService.getStats())
  }, [])

  // Handle search filter changes
  const handleFiltersChange = (filters: SearchFilters) => {
    setSearchFilters(filters)
    const results = leadService.searchLeads(filters)
    setSearchResults(results)
  }

  // Handle lead updates
  const handleLeadUpdate = (leadId: string, updates: Partial<Lead>) => {
    if (updates.status) {
      const success = leadService.updateLeadStatus(leadId, updates.status)
      if (success) {
        // Refresh all data
        const leads = leadService.getAllLeads()
        setAllLeads(leads)
        setStats(leadService.getStats())

        // Update search results
        const results = leadService.searchLeads(searchFilters)
        setSearchResults(results)
      }
    }
  }

  // Get leads by status for management tabs
  const prospects = allLeads.filter((lead) => lead.status === "prospect")
  const contacted = allLeads.filter((lead) => lead.status === "contacted")
  const replied = allLeads.filter((lead) => lead.status === "replied")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-balance mb-2">Lead Generation Dashboard</h1>
          <p className="text-muted-foreground text-pretty">
            Discover, contact, and manage potential leads with intelligent search, scoring, and tracking.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <LeadStatsOverview stats={stats} />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Lead Search
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Lead Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <div className="grid gap-6 lg:grid-cols-4">
              {/* Search Filters Sidebar */}
              <div className="lg:col-span-1">
                <LeadSearchFilters onFiltersChange={handleFiltersChange} activeFilters={searchFilters} />
              </div>

              {/* Search Results */}
              <div className="lg:col-span-3">
                <LeadSearchResults leads={searchResults} onLeadUpdate={handleLeadUpdate} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manage">
            <LeadManagementTabs
              prospects={prospects}
              contacted={contacted}
              replied={replied}
              onLeadUpdate={handleLeadUpdate}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <LeadAnalyticsDashboard leads={allLeads} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
