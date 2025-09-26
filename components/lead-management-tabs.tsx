"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Star,
  MoreHorizontal,
  MessageSquare,
  UserPlus,
  Calendar,
  Clock,
} from "lucide-react"
import type { Lead } from "@/lib/types"

interface LeadManagementTabsProps {
  prospects: Lead[]
  contacted: Lead[]
  replied: Lead[]
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void
}

export function LeadManagementTabs({ prospects, contacted, replied, onLeadUpdate }: LeadManagementTabsProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-600"
    if (rating >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return "Never"
    return new Date(date).toLocaleDateString()
  }

  const handleStatusChange = (leadId: string, newStatus: Lead["status"]) => {
    onLeadUpdate(leadId, { status: newStatus })
  }

  const LeadCard = ({
    lead,
    showContactedDate = false,
    showRepliedDate = false,
  }: { lead: Lead; showContactedDate?: boolean; showRepliedDate?: boolean }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10">{getInitials(lead.company_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{lead.company_name}</h3>
                <div className="flex items-center gap-1">
                  <Star className={`h-4 w-4 ${getRatingColor(lead.rating)}`} />
                  <span className={`text-sm font-medium ${getRatingColor(lead.rating)}`}>{lead.rating.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{lead.contact_name}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {lead.email}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {lead.phone}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  {lead.website}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {lead.city}, {lead.state}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline">{lead.industry}</Badge>
                <Badge variant="outline">{lead.business_type}</Badge>
                <Badge variant="outline">{lead.employee_count} employees</Badge>
              </div>

              {showContactedDate && lead.contacted_at && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Contacted: {formatDate(lead.contacted_at)}
                </div>
              )}

              {showRepliedDate && lead.replied_at && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Replied: {formatDate(lead.replied_at)}
                </div>
              )}

              {lead.description && (
                <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded">{lead.description}</p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {lead.status === "prospect" && (
                <DropdownMenuItem onClick={() => handleStatusChange(lead.id, "contacted")}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mark as Contacted
                </DropdownMenuItem>
              )}
              {(lead.status === "prospect" || lead.status === "contacted") && (
                <DropdownMenuItem onClick={() => handleStatusChange(lead.id, "replied")}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Mark as Replied
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleStatusChange(lead.id, "converted")}>
                <Star className="h-4 w-4 mr-2" />
                Mark as Converted
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="prospects" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="prospects" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Prospects ({prospects.length})
        </TabsTrigger>
        <TabsTrigger value="contacted" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Contacted ({contacted.length})
        </TabsTrigger>
        <TabsTrigger value="replied" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Replied ({replied.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="prospects" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Prospect Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {prospects.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No prospects yet</h3>
                <p className="text-muted-foreground">Use the search filters to find new leads.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prospects.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contacted" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Contacted Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {contacted.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No contacted leads</h3>
                <p className="text-muted-foreground">Start reaching out to your prospects.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contacted.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} showContactedDate />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="replied" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Replied Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {replied.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No replies yet</h3>
                <p className="text-muted-foreground">Keep following up with your contacted leads.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {replied.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} showContactedDate showRepliedDate />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
