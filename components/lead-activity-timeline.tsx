"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Activity, Phone, Mail, FileText, TrendingUp } from "lucide-react"
import { ActivityTracker } from "@/lib/activity-tracking"
import type { Lead } from "@/lib/types"

interface LeadActivityTimelineProps {
  lead: Lead
}

export function LeadActivityTimeline({ lead }: LeadActivityTimelineProps) {
  const activityTracker = ActivityTracker.getInstance()
  const timeline = activityTracker.getLeadTimeline(lead.id, lead)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "status_change":
        return <TrendingUp className="h-4 w-4" />
      case "contact_attempt":
        return <Phone className="h-4 w-4" />
      case "email_sent":
        return <Mail className="h-4 w-4" />
      case "note_added":
        return <FileText className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "status_change":
        return "text-blue-600"
      case "contact_attempt":
        return "text-green-600"
      case "email_sent":
        return "text-purple-600"
      case "note_added":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "prospect":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "contacted":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "replied":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "converted":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (days: number) => {
    if (days === 1) return "1 day"
    if (days < 7) return `${days} days`
    if (days < 30) return `${Math.round(days / 7)} weeks`
    return `${Math.round(days / 30)} months`
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-1" />
          Timeline
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Timeline - {lead.companyName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeline.statusHistory.map((status, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(status.status)}>{status.status}</Badge>
                      <span className="text-sm text-muted-foreground">{formatDate(status.timestamp)}</span>
                    </div>
                    {status.duration && (
                      <span className="text-sm text-muted-foreground">Duration: {formatDuration(status.duration)}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {timeline.activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
                    <p className="text-muted-foreground">Activities will appear here as you interact with this lead.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {timeline.activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className={`mt-0.5 ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
