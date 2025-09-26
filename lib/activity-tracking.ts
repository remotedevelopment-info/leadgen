import type { Lead } from "./types"

export interface Activity {
  id: string
  leadId: string
  type: "status_change" | "note_added" | "contact_attempt" | "email_sent" | "call_made" | "meeting_scheduled"
  description: string
  oldValue?: string
  newValue?: string
  timestamp: Date
  userId?: string
}

export interface LeadTimeline {
  leadId: string
  activities: Activity[]
  statusHistory: {
    status: Lead["status"]
    timestamp: Date
    duration?: number // in days
  }[]
}

export class ActivityTracker {
  private static instance: ActivityTracker
  private activities: Activity[] = []
  private readonly STORAGE_KEY = "lead-activities"

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker()
    }
    return ActivityTracker.instance
  }

  private loadFromStorage(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.activities = JSON.parse(stored).map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp),
        }))
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.activities))
    }
  }

  trackActivity(activity: Omit<Activity, "id" | "timestamp">): Activity {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    }

    this.activities.push(newActivity)
    this.saveToStorage()
    return newActivity
  }

  trackStatusChange(leadId: string, oldStatus: Lead["status"], newStatus: Lead["status"]): Activity {
    return this.trackActivity({
      leadId,
      type: "status_change",
      description: `Status changed from ${oldStatus} to ${newStatus}`,
      oldValue: oldStatus,
      newValue: newStatus,
    })
  }

  trackContactAttempt(leadId: string, method: "email" | "phone" | "linkedin", notes?: string): Activity {
    return this.trackActivity({
      leadId,
      type: "contact_attempt",
      description: `Contact attempt via ${method}${notes ? `: ${notes}` : ""}`,
    })
  }

  trackNoteAdded(leadId: string, note: string): Activity {
    return this.trackActivity({
      leadId,
      type: "note_added",
      description: `Note added: ${note.substring(0, 100)}${note.length > 100 ? "..." : ""}`,
    })
  }

  getLeadActivities(leadId: string): Activity[] {
    return this.activities
      .filter((activity) => activity.leadId === leadId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  getLeadTimeline(leadId: string, lead: Lead): LeadTimeline {
    const activities = this.getLeadActivities(leadId)
    const statusChanges = activities.filter((a) => a.type === "status_change")

    // Build status history
    const statusHistory: LeadTimeline["statusHistory"] = []

    // Add current status
    statusHistory.push({
      status: lead.status,
      timestamp: new Date(lead.updated_at),
    })

    // Add historical status changes (in reverse chronological order)
    statusChanges.forEach((change) => {
      if (change.oldValue) {
        statusHistory.push({
          status: change.oldValue as Lead["status"],
          timestamp: change.timestamp,
        })
      }
    })

    // Calculate durations
    for (let i = 0; i < statusHistory.length - 1; i++) {
      const current = statusHistory[i]
      const next = statusHistory[i + 1]
      const durationMs = current.timestamp.getTime() - next.timestamp.getTime()
      current.duration = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) // Convert to days
    }

    return {
      leadId,
      activities,
      statusHistory: statusHistory.reverse(), // Show chronologically
    }
  }

  getActivityStats(timeframe: "day" | "week" | "month" = "week") {
    const now = new Date()
    const startDate = new Date()

    switch (timeframe) {
      case "day":
        startDate.setDate(now.getDate() - 1)
        break
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
    }

    const recentActivities = this.activities.filter((activity) => activity.timestamp >= startDate)

    const stats = {
      totalActivities: recentActivities.length,
      statusChanges: recentActivities.filter((a) => a.type === "status_change").length,
      contactAttempts: recentActivities.filter((a) => a.type === "contact_attempt").length,
      notesAdded: recentActivities.filter((a) => a.type === "note_added").length,
      activitiesByDay: {} as { [key: string]: number },
      activitiesByType: {} as { [key: string]: number },
    }

    // Group by day
    recentActivities.forEach((activity) => {
      const day = activity.timestamp.toISOString().split("T")[0]
      stats.activitiesByDay[day] = (stats.activitiesByDay[day] || 0) + 1
      stats.activitiesByType[activity.type] = (stats.activitiesByType[activity.type] || 0) + 1
    })

    return stats
  }

  // Get leads that haven't been contacted in X days
  getStaleLeads(leads: Lead[], daysSinceContact = 7): Lead[] {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceContact)

    return leads.filter((lead) => {
      if (lead.status === "prospect") return false // New prospects aren't stale

      const leadActivities = this.getLeadActivities(lead.id)
      const lastContactAttempt = leadActivities.find((a) => a.type === "contact_attempt")

      if (!lastContactAttempt) {
        // If contacted but no activity recorded, check contacted_at date
        return lead.contacted_at && new Date(lead.contacted_at) < cutoffDate
      }

      return lastContactAttempt.timestamp < cutoffDate
    })
  }

  // Get conversion funnel data
  getConversionFunnel(leads: Lead[]) {
    const funnel = {
      prospects: leads.filter((l) => l.status === "prospect").length,
      contacted: leads.filter((l) => l.status === "contacted").length,
      replied: leads.filter((l) => l.status === "replied").length,
      converted: leads.filter((l) => l.status === "converted").length,
    }

    const total = funnel.prospects + funnel.contacted + funnel.replied + funnel.converted

    return {
      ...funnel,
      total,
      conversionRates: {
        prospectToContacted: total > 0 ? (funnel.contacted / total) * 100 : 0,
        contactedToReplied: funnel.contacted > 0 ? (funnel.replied / funnel.contacted) * 100 : 0,
        repliedToConverted: funnel.replied > 0 ? (funnel.converted / funnel.replied) * 100 : 0,
        overallConversion: total > 0 ? (funnel.converted / total) * 100 : 0,
      },
    }
  }
}
