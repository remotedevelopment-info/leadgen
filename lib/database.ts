import Database from "better-sqlite3"
import type { Lead, LeadStatus, Activity } from "./types"

class LeadDatabase {
  private db: Database.Database

  constructor() {
    // Initialize SQLite database
    this.db = new Database("leads.db")
    this.initializeTables()
    this.seedData()
  }

  private initializeTables() {
    // Create leads table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        contact_name TEXT,
        email TEXT,
        phone TEXT,
        website TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        country TEXT DEFAULT 'US',
        industry TEXT,
        business_type TEXT,
        employee_count INTEGER,
        annual_revenue INTEGER,
        description TEXT,
        rating REAL DEFAULT 0,
        score INTEGER DEFAULT 0,
        status TEXT DEFAULT 'prospect',
        source TEXT DEFAULT 'google_maps',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        contacted_at DATETIME,
        replied_at DATETIME
      )
    `)

    // Create activities table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        lead_id TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads (id)
      )
    `)

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
      CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);
      CREATE INDEX IF NOT EXISTS idx_leads_rating ON leads(rating);
      CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);
    `)
  }

  private seedData() {
    const count = this.db.prepare("SELECT COUNT(*) as count FROM leads").get() as { count: number }

    if (count.count === 0) {
      const sampleLeads = [
        {
          id: "1",
          company_name: "TechStart Solutions",
          contact_name: "Sarah Johnson",
          email: "sarah@techstart.com",
          phone: "(555) 123-4567",
          website: "https://techstart.com",
          address: "123 Innovation Dr",
          city: "San Francisco",
          state: "CA",
          zip_code: "94105",
          industry: "Technology",
          business_type: "B2B SaaS",
          employee_count: 25,
          annual_revenue: 2500000,
          description: "AI-powered business automation platform",
          rating: 4.2,
          score: 85,
          status: "prospect",
        },
        {
          id: "2",
          company_name: "Green Energy Co",
          contact_name: "Mike Chen",
          email: "mike@greenenergy.com",
          phone: "(555) 987-6543",
          website: "https://greenenergy.com",
          address: "456 Solar Ave",
          city: "Austin",
          state: "TX",
          zip_code: "78701",
          industry: "Energy",
          business_type: "B2B Services",
          employee_count: 150,
          annual_revenue: 15000000,
          description: "Renewable energy solutions for businesses",
          rating: 4.7,
          score: 92,
          status: "contacted",
        },
        {
          id: "3",
          company_name: "Local Cafe Chain",
          contact_name: "Emma Rodriguez",
          email: "emma@localcafe.com",
          phone: "(555) 456-7890",
          website: "https://localcafe.com",
          address: "789 Main St",
          city: "Portland",
          state: "OR",
          zip_code: "97201",
          industry: "Food & Beverage",
          business_type: "B2C Retail",
          employee_count: 45,
          annual_revenue: 3200000,
          description: "Artisanal coffee and pastries",
          rating: 3.8,
          score: 72,
          status: "replied",
        },
      ]

      const insertLead = this.db.prepare(`
        INSERT INTO leads (
          id, company_name, contact_name, email, phone, website, address, city, state, zip_code,
          industry, business_type, employee_count, annual_revenue, description, rating, score, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      for (const lead of sampleLeads) {
        insertLead.run(
          lead.id,
          lead.company_name,
          lead.contact_name,
          lead.email,
          lead.phone,
          lead.website,
          lead.address,
          lead.city,
          lead.state,
          lead.zip_code,
          lead.industry,
          lead.business_type,
          lead.employee_count,
          lead.annual_revenue,
          lead.description,
          lead.rating,
          lead.score,
          lead.status,
        )
      }
    }
  }

  // Lead CRUD operations
  getAllLeads(): Lead[] {
    const stmt = this.db.prepare("SELECT * FROM leads ORDER BY created_at DESC")
    return stmt.all() as Lead[]
  }

  getLeadById(id: string): Lead | null {
    const stmt = this.db.prepare("SELECT * FROM leads WHERE id = ?")
    return stmt.get(id) as Lead | null
  }

  getLeadsByStatus(status: LeadStatus): Lead[] {
    const stmt = this.db.prepare("SELECT * FROM leads WHERE status = ? ORDER BY created_at DESC")
    return stmt.all(status) as Lead[]
  }

  searchLeads(filters: {
    industries?: string[]
    businessTypes?: string[]
    employeeRanges?: string[]
    revenueRanges?: string[]
    locations?: string[]
    minRating?: number
    searchTerm?: string
  }): Lead[] {
    let query = "SELECT * FROM leads WHERE 1=1"
    const params: any[] = []

    if (filters.industries?.length) {
      query += ` AND industry IN (${filters.industries.map(() => "?").join(",")})`
      params.push(...filters.industries)
    }

    if (filters.businessTypes?.length) {
      query += ` AND business_type IN (${filters.businessTypes.map(() => "?").join(",")})`
      params.push(...filters.businessTypes)
    }

    if (filters.minRating) {
      query += " AND rating >= ?"
      params.push(filters.minRating)
    }

    if (filters.searchTerm) {
      query += " AND (company_name LIKE ? OR contact_name LIKE ? OR description LIKE ?)"
      const searchPattern = `%${filters.searchTerm}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    query += " ORDER BY score DESC, rating DESC"

    const stmt = this.db.prepare(query)
    return stmt.all(...params) as Lead[]
  }

  createLead(lead: Omit<Lead, "id" | "created_at" | "updated_at">): Lead {
    const id = Date.now().toString()
    const stmt = this.db.prepare(`
      INSERT INTO leads (
        id, company_name, contact_name, email, phone, website, address, city, state, zip_code,
        country, industry, business_type, employee_count, annual_revenue, description, rating, score, status, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      lead.company_name,
      lead.contact_name,
      lead.email,
      lead.phone,
      lead.website,
      lead.address,
      lead.city,
      lead.state,
      lead.zip_code,
      lead.country,
      lead.industry,
      lead.business_type,
      lead.employee_count,
      lead.annual_revenue,
      lead.description,
      lead.rating,
      lead.score,
      lead.status,
      lead.source,
    )

    return this.getLeadById(id)!
  }

  updateLeadStatus(id: string, status: LeadStatus): boolean {
    const stmt = this.db.prepare(`
      UPDATE leads 
      SET status = ?, 
          updated_at = CURRENT_TIMESTAMP,
          contacted_at = CASE WHEN ? = 'contacted' AND contacted_at IS NULL THEN CURRENT_TIMESTAMP ELSE contacted_at END,
          replied_at = CASE WHEN ? = 'replied' AND replied_at IS NULL THEN CURRENT_TIMESTAMP ELSE replied_at END
      WHERE id = ?
    `)

    const result = stmt.run(status, status, status, id)
    return result.changes > 0
  }

  // Activity tracking
  addActivity(leadId: string, type: string, description: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO activities (id, lead_id, type, description)
      VALUES (?, ?, ?, ?)
    `)

    stmt.run(Date.now().toString(), leadId, type, description)
  }

  getActivitiesForLead(leadId: string): Activity[] {
    const stmt = this.db.prepare("SELECT * FROM activities WHERE lead_id = ? ORDER BY created_at DESC")
    return stmt.all(leadId) as Activity[]
  }

  // Analytics
  getLeadStats() {
    const totalStmt = this.db.prepare("SELECT COUNT(*) as count FROM leads")
    const prospectStmt = this.db.prepare('SELECT COUNT(*) as count FROM leads WHERE status = "prospect"')
    const contactedStmt = this.db.prepare('SELECT COUNT(*) as count FROM leads WHERE status = "contacted"')
    const repliedStmt = this.db.prepare('SELECT COUNT(*) as count FROM leads WHERE status = "replied"')
    const avgScoreStmt = this.db.prepare("SELECT AVG(score) as avg FROM leads")

    return {
      total: (totalStmt.get() as { count: number }).count,
      prospects: (prospectStmt.get() as { count: number }).count,
      contacted: (contactedStmt.get() as { count: number }).count,
      replied: (repliedStmt.get() as { count: number }).count,
      averageScore: Math.round((avgScoreStmt.get() as { avg: number }).avg || 0),
    }
  }

  close() {
    this.db.close()
  }
}

// Singleton instance
let dbInstance: LeadDatabase | null = null

export function getDatabase(): LeadDatabase {
  if (!dbInstance) {
    dbInstance = new LeadDatabase()
  }
  return dbInstance
}

export { LeadDatabase }
