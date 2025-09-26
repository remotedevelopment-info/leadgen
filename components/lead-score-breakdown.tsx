"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react"
import { LeadScoringEngine } from "@/lib/lead-scoring"
import type { Lead } from "@/lib/types"

interface LeadScoreBreakdownProps {
  lead: Lead
}

export function LeadScoreBreakdown({ lead }: LeadScoreBreakdownProps) {
  const scoringEngine = LeadScoringEngine.getInstance()
  const breakdown = scoringEngine.getScoreBreakdown(lead)
  const category = scoringEngine.getScoreCategory(lead.rating)
  const suggestions = scoringEngine.suggestImprovements(lead)

  const breakdownItems = [
    { label: "Industry", data: breakdown.industry },
    { label: "Business Type", data: breakdown.businessType },
    { label: "Company Size", data: breakdown.size },
    { label: "Revenue", data: breakdown.revenue },
    { label: "Location", data: breakdown.location },
    { label: "Data Quality", data: breakdown.dataQuality },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-1" />
          Score Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lead Score Breakdown - {lead.company_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold">{lead.rating.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
                <Badge className={category.color}>{category.category}</Badge>
              </div>
              <Progress value={lead.rating * 10} className="mb-2" />
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Score Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {breakdownItems.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {item.data.score.toFixed(1)} × {(item.data.weight * 100).toFixed(0)}%
                        </span>
                        <span className="font-medium">{item.data.contribution.toFixed(2)}</span>
                      </div>
                    </div>
                    <Progress value={item.data.score * 10} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
