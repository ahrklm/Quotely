
export enum QuoteStatus {
  DRAFT = 'Draft',
  SHARED = 'Shared',
  WAITING = 'Waiting for approval',
  APPROVED = 'Approved',
  CANCELED = 'Canceled'
}

export interface RateComponent {
  id: string;
  label: string;
  value: number;
}

export interface BusinessDomain {
  id: string;
  name: string;
  hourlyRate: number;
  rateComponents?: RateComponent[];
  createdBy: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  note: string;
  createdBy: string;
  updatedAt: string;
}

export interface QuoteSection {
  id: string;
  quoteId: string;
  title: string;
  sortOrder: number;
  isHidden?: boolean;
}

export interface QuoteLineItem {
  id:string;
  quoteId: string;
  sectionId?: string;
  title: string;
  description: string;
  hours: number;
  storyPoints: number;
  sortOrder: number;
}

export interface Quote {
  id: string;
  title: string;
  status: QuoteStatus;
  businessDomainId: string;
  projectId: string;
  contactId: string;
  pricePerHour: number;
  totalHours: number;
  totalPoints: number;
  totalPrice: number;
  description: string;
  requestDate: string;
  createdBy: string;
  updatedAt: string;
  shareToken: string;
  ppmCode?: string;
  afasCode?: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'info' | 'primary' | 'secondary';
}

export interface SearchResult {
  id: string;
  type: 'Quote' | 'Template' | 'Project' | 'Domain' | 'Contact';
  label: string;
  route: string;
  iconName: string;
  tags: string[];
}