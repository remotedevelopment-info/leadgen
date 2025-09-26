"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Building2, Mail, Phone, Globe, MapPin, Star, MoreHorizontal, MessageSquare, UserPlus } from "lucide-react"
import { LeadScoreBreakdown } from "./lead-score-breakdown"
import type { Lead } from "@/lib/types"

interface LeadSearchResultsProps {
  leads: Lead[]
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void
}

export function LeadSearchResults({ leads, onLeadUpdate }: LeadSearchResultsProps) {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])

  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "prospect":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "contacted":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "replied":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "converted":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-600"
    if (rating >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreCategory = (rating: number) => {
    if (rating >= 8.5) return { label: "Hot", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" }
    if (rating >= 7.0)
      return { label: "Warm", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" }
    if (rating >= 5.5)
      return { label: "Qualified", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" }
    if (rating >= 4.0) return { label: "Cold", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" }
    return { label: "Poor Fit", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" }
  }

  const handleStatusChange = (leadId: string, newStatus: Lead["status"]) => {
    onLeadUpdate(leadId, { status: newStatus })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No leads found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters to find more leads.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Search Results ({leads.length} leads)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Avg Rating: {(leads.reduce((sum, lead) => sum + lead.rating, 0) / leads.length).toFixed(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => {
                const scoreCategory = getScoreCategory(lead.rating)
                return (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10">{getInitials(lead.company_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{lead.company_name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {lead.website}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{lead.contact_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{lead.industry}</div>
                        <div className="text-sm text-muted-foreground">{lead.business_type}</div>
                        <div className="text-xs text-muted-foreground">{lead.employee_count} employees</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Star className={`h-4 w-4 ${getRatingColor(lead.rating)}`} />
                          <span className={`font-medium ${getRatingColor(lead.rating)}`}>{lead.rating.toFixed(1)}</span>
                        </div>
                        <Badge className={scoreCategory.color} variant="outline">
                          {scoreCategory.label}
                        </Badge>
                        <div className="mt-1">
                          <LeadScoreBreakdown lead={lead} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {lead.city}, {lead.state}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(lead.id, "contacted")}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Mark as Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(lead.id, "replied")}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Mark as Replied
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(lead.id, "converted")}>
                            <Star className="h-4 w-4 mr-2" />
                            Mark as Converted
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
