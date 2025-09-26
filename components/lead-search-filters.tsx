"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import type { SearchFilters } from "@/lib/types"
import { LeadService } from "@/lib/lead-service"

interface LeadSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
  activeFilters: SearchFilters
}

export function LeadSearchFilters({ onFiltersChange, activeFilters }: LeadSearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [dynamicOptions, setDynamicOptions] = useState({
    industries: [] as string[],
    businessTypes: [] as string[],
    cities: [] as string[],
    states: [] as string[],
    employeeRanges: [] as string[],
    revenueRanges: [] as string[],
  })

  // Load dynamic filter options from existing data
  useEffect(() => {
    const leadService = LeadService.getInstance()
    const options = leadService.getAvailableFilterOptions()
    setDynamicOptions(options)
  }, [])

  const handleIndustryChange = (industry: string, checked: boolean) => {
    const current = activeFilters.industries || []
    const updated = checked ? [...current, industry] : current.filter((i) => i !== industry)

    onFiltersChange({
      ...activeFilters,
      industries: updated,
    })
  }

  const handleBusinessTypeChange = (businessType: string, checked: boolean) => {
    const current = activeFilters.businessTypes || []
    const updated = checked ? [...current, businessType] : current.filter((bt) => bt !== businessType)

    onFiltersChange({
      ...activeFilters,
      businessTypes: updated,
    })
  }

  const handleEmployeeRangeChange = (range: string, checked: boolean) => {
    const current = activeFilters.employeeRanges || []
    const updated = checked ? [...current, range] : current.filter((er) => er !== range)

    onFiltersChange({
      ...activeFilters,
      employeeRanges: updated,
    })
  }

  const handleRevenueRangeChange = (range: string, checked: boolean) => {
    const current = activeFilters.revenueRanges || []
    const updated = checked ? [...current, range] : current.filter((rr) => rr !== range)

    onFiltersChange({
      ...activeFilters,
      revenueRanges: updated,
    })
  }

  const handleLocationChange = (location: string, checked: boolean) => {
    const current = activeFilters.locations || []
    const updated = checked ? [...current, location] : current.filter((l) => l !== location)

    onFiltersChange({
      ...activeFilters,
      locations: updated,
    })
  }

  const handleRatingChange = (values: number[]) => {
    onFiltersChange({
      ...activeFilters,
      minRating: values[0],
    })
  }

  const handleSearchTermChange = () => {
    onFiltersChange({
      ...activeFilters,
      searchTerm: searchTerm.trim(),
    })
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    onFiltersChange({})
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (activeFilters.industries?.length) count += activeFilters.industries.length
    if (activeFilters.businessTypes?.length) count += activeFilters.businessTypes.length
    if (activeFilters.employeeRanges?.length) count += activeFilters.employeeRanges.length
    if (activeFilters.revenueRanges?.length) count += activeFilters.revenueRanges.length
    if (activeFilters.locations?.length) count += activeFilters.locations.length
    if (activeFilters.searchTerm) count += 1
    if (activeFilters.minRating && activeFilters.minRating > 0) count += 1
    return count
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Lead Search Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && <Badge variant="secondary">{getActiveFilterCount()} active</Badge>}
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Term */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="Search companies, contacts, descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchTermChange()}
            />
            <Button onClick={handleSearchTermChange}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {activeFilters.searchTerm && (
            <Badge variant="outline" className="mt-2">
              Searching: {activeFilters.searchTerm}
            </Badge>
          )}
        </div>

        {/* Industry Filter */}
        <div className="space-y-3">
          <Label>Industry</Label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {dynamicOptions.industries.map((industry) => (
              <div key={industry} className="flex items-center space-x-2">
                <Checkbox
                  id={`industry-${industry}`}
                  checked={activeFilters.industries?.includes(industry) || false}
                  onCheckedChange={(checked) => handleIndustryChange(industry, checked as boolean)}
                />
                <Label htmlFor={`industry-${industry}`} className="text-sm">
                  {industry}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Business Type Filter */}
        <div className="space-y-3">
          <Label>Business Type</Label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {dynamicOptions.businessTypes.map((businessType) => (
              <div key={businessType} className="flex items-center space-x-2">
                <Checkbox
                  id={`business-${businessType}`}
                  checked={activeFilters.businessTypes?.includes(businessType) || false}
                  onCheckedChange={(checked) => handleBusinessTypeChange(businessType, checked as boolean)}
                />
                <Label htmlFor={`business-${businessType}`} className="text-sm">
                  {businessType}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Count Filter */}
        <div className="space-y-3">
          <Label>Employee Count</Label>
          <div className="grid grid-cols-2 gap-2">
            {dynamicOptions.employeeRanges.map((range) => (
              <div key={range} className="flex items-center space-x-2">
                <Checkbox
                  id={`employee-${range}`}
                  checked={activeFilters.employeeRanges?.includes(range) || false}
                  onCheckedChange={(checked) => handleEmployeeRangeChange(range, checked as boolean)}
                />
                <Label htmlFor={`employee-${range}`} className="text-sm">
                  {range}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Filter */}
        <div className="space-y-3">
          <Label>Revenue</Label>
          <div className="grid grid-cols-2 gap-2">
            {dynamicOptions.revenueRanges.map((range) => (
              <div key={range} className="flex items-center space-x-2">
                <Checkbox
                  id={`revenue-${range}`}
                  checked={activeFilters.revenueRanges?.includes(range) || false}
                  onCheckedChange={(checked) => handleRevenueRangeChange(range, checked as boolean)}
                />
                <Label htmlFor={`revenue-${range}`} className="text-sm">
                  {range}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Location Filter */}
        <div className="space-y-3">
          <Label>Location</Label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {[...dynamicOptions.cities.map((city) => city), ...dynamicOptions.states.map((state) => state)].map(
              (location) => (
                <div key={location} className="flex items-center space-x-2">
                  <Checkbox
                    id={`location-${location}`}
                    checked={activeFilters.locations?.includes(location) || false}
                    onCheckedChange={(checked) => handleLocationChange(location, checked as boolean)}
                  />
                  <Label htmlFor={`location-${location}`} className="text-sm">
                    {location}
                  </Label>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <Label>Minimum Lead Rating</Label>
          <div className="px-2">
            <Slider
              value={[activeFilters.minRating || 0]}
              onValueChange={handleRatingChange}
              max={10}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>0</span>
              <span className="font-medium">{(activeFilters.minRating || 0).toFixed(1)}+</span>
              <span>10</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
