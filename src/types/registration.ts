export interface RegistrationRecord {
  id: number;
  ticket_number: string;
  name: string;
  gender: string;
  institution: string;
  status: string;
  level?: string;
  department?: string;
  member_type: string;
  state?: string;
  region?: string;
  center?: string;
  membership_status?: string;
  denomination?: string;
  location?: string;
  expectations?: string;
  photo: string;
  created_at: string;
}

export interface RegistrationFormData {
  name: string;
  gender: string;
  institution: string;
  status: string;
  level: string;
  department: string;
  member_type: string;
  state: string;
  region: string;
  center: string;
  membership_status: string;
  denomination: string;
  location: string;
  expectations: string;
  photo: string;
}
