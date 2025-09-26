import type { Lead } from "./types"

export interface ScoringCriteria {
  industry: { [key: string]: number }
  businessType: { [key: string]: number }
  employeeCount: { [key: string]: number }
  revenue: { [key: string]: number }
  location: { [key: string]: number }
  websiteQuality: number
  contactInfoCompleteness: number
  businessMaturity: number
}

export interface ScoringWeights {
  industry: number
  businessType: number
  size: number
  revenue: number
  location: number
  dataQuality: number
}

export class LeadScoringEngine {
  private static instance: LeadScoringEngine
  private criteria: ScoringCriteria
  private weights: ScoringWeights

  private constructor() {
    this.criteria = {
      industry: {
        Technology: 9.5,
        Healthcare: 9.0,
        Finance: 8.5,
        "Professional Services": 8.0,
        Manufacturing: 7.5,
        "Real Estate": 7.0,
        Education: 6.5,
        Retail: 6.0,
        "Food & Beverage": 5.5,
        "Health & Fitness": 5.0,
        Design: 7.5,
        Construction: 6.5,
        Automotive: 6.0,
        Entertainment: 4.5,
        Energy: 8.0,
      },
      businessType: {
        "B2B SaaS": 9.5,
        "B2B Services": 9.0,
        "B2C Retail": 6.0,
        "E-commerce": 7.5,
        "Professional Services": 8.5,
        "Healthcare Services": 8.0,
        "Financial Services": 8.5,
        Manufacturing: 7.0,
        Construction: 6.5,
        "Real Estate": 7.0,
        Education: 6.5,
        "Non-profit": 4.0,
      },
      employeeCount: {
        1: 4.0,
        10: 6.0,
        25: 7.5,
        50: 8.5,
        100: 9.0,
        250: 9.5,
        500: 8.0,
      },
      revenue: {
        500000: 3.0,
        1000000: 5.0,
        2500000: 6.5,
        5000000: 8.0,
        10000000: 9.0,
        25000000: 9.5,
        50000000: 8.5,
      },
      location: {
        CA: 9.0, // Tech hub
        NY: 8.5, // Business hub
        TX: 8.0, // Growing market
        FL: 7.5, // Growing market
        WA: 8.5, // Tech hub
        MA: 8.0, // Education/tech
        IL: 7.5, // Business hub
        OR: 7.0, // Growing tech
        CO: 7.0, // Growing market
        NC: 6.5, // Growing market
      },
      websiteQuality: 8.0,
      contactInfoCompleteness: 9.0,
      businessMaturity: 7.5,
    }

    this.weights = {
      industry: 0.25,
      businessType: 0.2,
      size: 0.15,
      revenue: 0.2,
      location: 0.1,
      dataQuality: 0.1,
    }
  }

  static getInstance(): LeadScoringEngine {
    if (!LeadScoringEngine.instance) {
      LeadScoringEngine.instance = new LeadScoringEngine()
    }
    return LeadScoringEngine.instance
  }

  calculateLeadScore(lead: Lead): number {
    let score = 0

    // Industry score
    const industryScore = this.criteria.industry[lead.industry] || 5.0
    score += industryScore * this.weights.industry

    const businessTypeScore = this.criteria.businessType[lead.business_type] || 5.0
    score += businessTypeScore * this.weights.businessType

    const sizeScore = this.getEmployeeCountScore(lead.employee_count)
    score += sizeScore * this.weights.size

    const revenueScore = this.getRevenueScore(lead.annual_revenue)
    score += revenueScore * this.weights.revenue

    // Location score
    const locationScore = this.criteria.location[lead.state] || 5.0
    score += locationScore * this.weights.location

    // Data quality score
    const dataQualityScore = this.calculateDataQualityScore(lead)
    score += dataQualityScore * this.weights.dataQuality

    // Normalize to 1-10 scale
    return Math.min(10, Math.max(1, score))
  }

  private getEmployeeCountScore(employeeCount: number): number {
    if (employeeCount >= 500) return 8.0
    if (employeeCount >= 250) return 9.5
    if (employeeCount >= 100) return 9.0
    if (employeeCount >= 50) return 8.5
    if (employeeCount >= 25) return 7.5
    if (employeeCount >= 10) return 6.0
    return 4.0
  }

  private getRevenueScore(revenue: number): number {
    if (revenue >= 50000000) return 8.5
    if (revenue >= 25000000) return 9.5
    if (revenue >= 10000000) return 9.0
    if (revenue >= 5000000) return 8.0
    if (revenue >= 2500000) return 6.5
    if (revenue >= 1000000) return 5.0
    return 3.0
  }

  private calculateDataQualityScore(lead: Lead): number {
    let score = 0
    let maxScore = 0

    // Website quality
    if (lead.website && lead.website.includes("http")) {
      score += 2
    }
    maxScore += 2

    // Contact completeness
    if (lead.email && lead.email.includes("@")) score += 2
    if (lead.phone && lead.phone.length >= 10) score += 2
    if (lead.contact_name && lead.contact_name.length > 0) score += 1
    maxScore += 5

    // Address completeness
    if (lead.address && lead.address.length > 0) score += 1
    if (lead.zip_code && lead.zip_code.length >= 5) score += 1
    maxScore += 2

    // Description quality
    if (lead.description && lead.description.length > 20) score += 1
    maxScore += 1

    return (score / maxScore) * 10
  }

  getScoreBreakdown(lead: Lead) {
    const industryScore = this.criteria.industry[lead.industry] || 5.0
    const businessTypeScore = this.criteria.businessType[lead.business_type] || 5.0
    const sizeScore = this.getEmployeeCountScore(lead.employee_count)
    const revenueScore = this.getRevenueScore(lead.annual_revenue)
    const locationScore = this.criteria.location[lead.state] || 5.0
    const dataQualityScore = this.calculateDataQualityScore(lead)

    return {
      industry: {
        score: industryScore,
        weight: this.weights.industry,
        contribution: industryScore * this.weights.industry,
      },
      businessType: {
        score: businessTypeScore,
        weight: this.weights.businessType,
        contribution: businessTypeScore * this.weights.businessType,
      },
      size: {
        score: sizeScore,
        weight: this.weights.size,
        contribution: sizeScore * this.weights.size,
      },
      revenue: {
        score: revenueScore,
        weight: this.weights.revenue,
        contribution: revenueScore * this.weights.revenue,
      },
      location: {
        score: locationScore,
        weight: this.weights.location,
        contribution: locationScore * this.weights.location,
      },
      dataQuality: {
        score: dataQualityScore,
        weight: this.weights.dataQuality,
        contribution: dataQualityScore * this.weights.dataQuality,
      },
    }
  }

  getScoreCategory(score: number): { category: string; color: string; description: string } {
    if (score >= 8.5) {
      return {
        category: "Hot Lead",
        color: "text-red-600",
        description: "High-priority prospect with excellent fit",
      }
    } else if (score >= 7.0) {
      return {
        category: "Warm Lead",
        color: "text-orange-600",
        description: "Good prospect worth pursuing",
      }
    } else if (score >= 5.5) {
      return {
        category: "Qualified Lead",
        color: "text-yellow-600",
        description: "Decent prospect with some potential",
      }
    } else if (score >= 4.0) {
      return {
        category: "Cold Lead",
        color: "text-blue-600",
        description: "Lower priority prospect",
      }
    } else {
      return {
        category: "Poor Fit",
        color: "text-gray-600",
        description: "Not a good match for your product",
      }
    }
  }

  // Suggest improvements for lead scoring
  suggestImprovements(lead: Lead): string[] {
    const suggestions: string[] = []
    const breakdown = this.getScoreBreakdown(lead)

    if (breakdown.dataQuality.score < 7) {
      suggestions.push("Improve data quality by verifying contact information")
    }

    if (breakdown.industry.score < 6) {
      suggestions.push("Consider if this industry aligns with your target market")
    }

    if (breakdown.size.score < 6) {
      suggestions.push("Company size may be too small for your solution")
    }

    if (breakdown.revenue.score < 6) {
      suggestions.push("Revenue range may indicate limited budget")
    }

    if (suggestions.length === 0) {
      suggestions.push("This is a well-qualified lead - prioritize outreach")
    }

    return suggestions
  }

  // Batch score multiple leads
  scoreLeads(leads: Lead[]): Lead[] {
    return leads.map((lead) => ({
      ...lead,
      rating: this.calculateLeadScore(lead),
    }))
  }
}
