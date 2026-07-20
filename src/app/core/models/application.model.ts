export type ApplicationStatus =
  'TO_APPLY' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'ACCEPTED' | 'REJECTED';

export type EventType = 'AUTOMATIC' | 'MANUAL';

export interface ApplicationEvent {
  id: string;
  applicationId: string;
  type: EventType;
  description: string;
  previousStatus?: string;
  newStatus?: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  colorHex: string;
  createdAt?: string;
}

export interface Application {
  id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  salaryRange?: string;
  status: ApplicationStatus;
  appliedAt?: string;
  location?: string;
  submittedDocuments?: string[];
  jobDescription?: string;
  notes?: string;
  tags?: Tag[];
  events?: ApplicationEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationRequest {
  company_name: string;
  job_title: string;
  job_url?: string;
  salary_range?: string;
  status: ApplicationStatus;
  applied_at?: string;
  location?: string;
  submitted_documents?: string[];
  job_description?: string;
  notes?: string;
}

export interface UpdateApplicationRequest {
  company_name?: string;
  job_title?: string;
  job_url?: string;
  salary_range?: string;
  status?: ApplicationStatus;
  applied_at?: string;
  location?: string;
  submitted_documents?: string[];
  job_description?: string;
  notes?: string;
}

export interface ListApplicationsResponse {
  applications: Application[];
  next_page_token?: string;
}

export interface ApplicationStatsResponse {
  total_applications: number;
  funil_by_status: Record<ApplicationStatus, number>;
  conversion_rate_interview?: number;
  top_tags?: { tag_name: string; count: number }[];
}
