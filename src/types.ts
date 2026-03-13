export type UserRole = 'client' | 'staff' | 'admin';
export type KYCStatus = 'pending' | 'verified' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  kycStatus: KYCStatus;
  phoneNumber?: string;
  createdAt: string;
}

export interface Matter {
  id: string;
  title: string;
  description: string;
  clientId: string;
  department: 'Corporate Law' | 'Dispute Resolution' | 'Real Estate' | 'Intellectual Property' | 'Family Law';
  status: 'Open' | 'In Progress' | 'Court Stage' | 'Closed';
  nextCourtDate?: string;
  lastUpdate?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  department: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

export interface LegalDocument {
  id: string;
  name: string;
  type: 'Evidence' | 'Firm Prepared' | 'Identity';
  url: string;
  matterId: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  matterId: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  matterId?: string;
  amount: number;
  status: 'unpaid' | 'paid' | 'overdue';
  dueDate: string;
  description: string;
  createdAt: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Corporate Law' | 'Dispute Resolution' | 'Real Estate' | 'Intellectual Property' | 'Family Law' | 'Portal Help';
  tags?: string[];
  createdAt: string;
}
