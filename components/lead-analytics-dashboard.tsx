"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Users, Clock, Target, AlertTriangle } from "lucide-react"
import { ActivityTracker } from "@/lib/activity-tracking"
import type { Lead } from "@/lib/types"

interface LeadAnalyticsDashboardProps {
  leads: Lead[]
}

export function LeadAnalyticsDashboard({ leads }: LeadAnalyticsDashboardProps) {
  const activityTracker = ActivityTracker.getInstance()
  const activityStats = activityTracker.getActivityStats("week")
  const conversionFunnel = activityTracker.getConversionFunnel(leads)
  const staleLeads = activityTracker.getStaleLeads(leads, 7)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  // Prepare funnel data for chart
  const funnelData = [
    { name: "Prospects", value: conversionFunnel.prospects, percentage: 100 },
    {
      name: "Contacted",
      value: conversionFunnel.contacted,
      percentage: conversionFunnel.conversionRates.prospectToContacted,
    },
    {
      name: "Replied",
      value: conversionFunnel.replied,
      percentage: conversionFunnel.conversionRates.contactedToReplied,
    },
    {
      name: "Converted",
      value: conversionFunnel.converted,
      percentage: conversionFunnel.conversionRates.repliedToConverted,
    },
  ]

  // Prepare activity data for chart
  const activityChartData = Object.entries(activityStats.activitiesByDay).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    activities: count,
  }))

  // Prepare activity type data for pie chart
  const activityTypeData = Object.entries(activityStats.activitiesByType).map(([type, count]) => ({
    name: type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value: count,
  }))

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionFunnel.conversionRates.overallConversion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Overall lead to conversion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityStats.totalActivities}</div>
            <p className="text-xs text-muted-foreground">{activityStats.contactAttempts} contact attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionFunnel.conversionRates.contactedToReplied.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Contacted to replied</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stale Leads</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staleLeads.length}</div>
            <p className="text-xs text-muted-foreground">Need follow-up</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="funnel" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="activity">Activity Trends</TabsTrigger>
          <TabsTrigger value="stale">Stale Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((stage, index) => (
                  <div key={stage.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{stage.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{stage.value} leads</span>
                        <Badge variant="outline">{stage.percentage.toFixed(1)}%</Badge>
                      </div>
                    </div>
                    <Progress value={stage.percentage} className="h-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={activityChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="activities" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={activityTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {activityTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stale" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Stale Leads Requiring Follow-up
              </CardTitle>
            </CardHeader>
            <CardContent>
              {staleLeads.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No leads require immediate follow-up.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {staleLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="font-medium">{lead.company_name}</div>
                        <div className="text-sm text-muted-foreground">{lead.contact_name}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {lead.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Last contact: {lead.contacted_at ? new Date(lead.contacted_at).toLocaleDateString() : "Never"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
