export interface StudentProfile {
  id?: string; // UUID from Supabase auth.users
  name: string;
  rollNo: string;
  dept: string;
  year: string;
  section: string;
  college: string;
  phone: string;
}

export interface EventRecord {
  id?: number;
  user_id?: string;
  title: string;
  organizer: string;
  venue: string;
  type: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  role: string; // participant, volunteer, organizer, winner
  result?: string;
  notes?: string;
  createdAt: string; // ISO datetime
  hasCertificate?: boolean; // UI state
  hasApplication?: boolean; // UI state
}


export interface Certificate {
  id?: string;
  eventId: number;
  fileName: string;
  mimeType: string;
  storagePath: string;
}

export interface Application {
  id?: number;
  user_id?: string;
  event_id: number;
  addressee: string;
  body_text: string;
  template: string;
  created_at: string;
}

export interface Addressee {
  id?: number;
  name: string;
  designation: string;
}
