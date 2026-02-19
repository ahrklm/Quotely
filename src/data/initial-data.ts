
import { QuoteStatus, BusinessDomain, Project, Contact, Quote, QuoteLineItem, QuoteSection } from '../models/types';

export const initialDomains: BusinessDomain[] = [
  { id: 'bd1', name: 'Ground', hourlyRate: 99, createdBy: 'Franck', updatedAt: '2025-01-28', rateComponents: [] },
  { id: 'bd2', name: 'Finance', hourlyRate: 110, createdBy: 'Kees', updatedAt: '2025-01-28', rateComponents: [] },
  { id: 'bd3', name: 'E&M', hourlyRate: 86, createdBy: 'Mabel', updatedAt: '2025-01-28', rateComponents: [] },
  {
    id: 'bd4',
    name: 'Hr',
    hourlyRate: 116.75,
    createdBy: 'Mabel',
    updatedAt: '2025-01-28',
    rateComponents: [
      { id: 'rc-bd4-1', label: 'Base Rate', value: 100 },
      { id: 'rc-bd4-2', label: 'Managament Fee', value: 16.75 },
    ],
  },
];

export const initialProjects: Project[] = [
  { id: 'p1', name: 'Ursula', description: 'Main architecture revamp', createdBy: 'Franck', updatedAt: '2025-01-28' },
  { id: 'p2', name: 'Victory', description: 'New mobile app rollout', createdBy: 'Mabel', updatedAt: '2025-01-28' },
  { id: 'p3', name: 'SkyNet', description: 'Automated baggage handling', createdBy: 'Kees', updatedAt: '2025-02-10' },
];

export const initialContacts: Contact[] = [
  { id: 'c1', name: 'Franck', email: 'franck@klm.com', note: 'Main person for ground', createdBy: 'Admin', updatedAt: '2025-01-28' },
  { id: 'c2', name: 'Kees', email: 'kees@klm.com', note: 'Finance stakeholder', createdBy: 'Admin', updatedAt: '2025-01-28' },
  { id: 'c3', name: 'Henk', email: 'henk@klm.com', note: 'Architecture requester', createdBy: 'Admin', updatedAt: '2025-01-28' },
];

export const initialQuotes: Quote[] = [
  {
    id: 'q1',
    title: 'Architecture Review',
    status: QuoteStatus.APPROVED,
    businessDomainId: 'bd1',
    projectId: 'p1',
    contactId: 'c3',
    pricePerHour: 100,
    totalHours: 40,
    totalPoints: 60,
    totalPrice: 4000,
    description: 'Reverting workflow status criteria',
    requestDate: '2024-11-15',
    createdBy: 'Jon Snow',
    updatedAt: '2024-11-20',
    shareToken: 'token-q1',
  },
  {
    id: 'q2',
    title: 'Mobile App Discovery',
    status: QuoteStatus.APPROVED,
    businessDomainId: 'bd2',
    projectId: 'p2',
    contactId: 'c1',
    pricePerHour: 110,
    totalHours: 80,
    totalPoints: 120,
    totalPrice: 8800,
    description: 'UX/UI Phase for Victory project',
    requestDate: '2024-12-05',
    createdBy: 'Jon Snow',
    updatedAt: '2024-12-10',
    shareToken: 'token-q2',
  },
  {
    id: 'q3',
    title: 'Baggage Automation Backend',
    status: QuoteStatus.WAITING,
    businessDomainId: 'bd3',
    projectId: 'p3',
    contactId: 'c2',
    pricePerHour: 86,
    totalHours: 120,
    totalPoints: 200,
    totalPrice: 10320,
    description: 'Core logic for SkyNet',
    requestDate: '2025-01-10',
    createdBy: 'Jon Snow',
    updatedAt: '2025-01-15',
    shareToken: 'token-q3',
  },
  {
    id: 'q4',
    title: 'Cloud Migration',
    status: QuoteStatus.DRAFT,
    businessDomainId: 'bd1',
    projectId: 'p1',
    contactId: 'c3',
    pricePerHour: 100,
    totalHours: 250,
    totalPoints: 400,
    totalPrice: 25000,
    description: 'Transitioning legacy servers',
    requestDate: '2025-02-01',
    createdBy: 'Jon Snow',
    updatedAt: '2025-02-12',
    shareToken: 'token-q4',
  },
  {
    id: 'q5',
    title: 'Security Audit',
    status: QuoteStatus.APPROVED,
    businessDomainId: 'bd2',
    projectId: 'p2',
    contactId: 'c1',
    pricePerHour: 110,
    totalHours: 20,
    totalPoints: 30,
    totalPrice: 2200,
    description: 'Annual compliance check',
    requestDate: '2025-01-20',
    createdBy: 'Jon Snow',
    updatedAt: '2025-01-25',
    shareToken: 'token-q5',
  }
];

export const initialLineItems: QuoteLineItem[] = [
  { id: 'li1', quoteId: 'q1', title: 'Reverting workflow status criteria', description: 'To old version', hours: 8, storyPoints: 8, sortOrder: 0 },
  { id: 'li2', quoteId: 'q1', title: 'Reimplementing Phase code criteria', description: 'Correcting tests', hours: 8, storyPoints: 8, sortOrder: 1 },
  { id: 'li3', quoteId: 'q1', title: 'Implementing RDY criteria changes', description: 'New tests', hours: 8, storyPoints: 8, sortOrder: 2 },
  { id: 'li4', quoteId: 'q1', title: 'General communication', description: '', hours: 8, storyPoints: 8, sortOrder: 3 },
  { id: 'li5', quoteId: 'q1', title: 'Deployments including backups', description: 'Standby on live', hours: 8, storyPoints: 8, sortOrder: 4 },
];

export const initialSections: QuoteSection[] = [];

export const initialTemplates: Quote[] = [
  {
    id: 't-fasttrack',
    title: 'FastTrack Quote Template',
    status: QuoteStatus.DRAFT,
    businessDomainId: 'bd1',
    projectId: '',
    contactId: '',
    pricePerHour: 100,
    totalHours: 76,
    totalPoints: 0,
    totalPrice: 7600,
    description: 'Standard FastTrack configuration for quick project kick-offs.',
    requestDate: '2025-01-01',
    createdBy: 'System',
    updatedAt: '2025-01-01',
    shareToken: 'token-t-fasttrack',
  }
];

export const initialTemplateSections: QuoteSection[] = [
  { id: 'ts-ft-1', quoteId: 't-fasttrack', title: 'General actions', sortOrder: 0, isHidden: false },
  { id: 'ts-ft-2', quoteId: 't-fasttrack', title: 'Must Haves', sortOrder: 1, isHidden: false },
  { id: 'ts-ft-3', quoteId: 't-fasttrack', title: 'Nice to haves', sortOrder: 2, isHidden: false },
];

export const initialTemplateLineItems: QuoteLineItem[] = [
  { id: 'tli-ft-1', quoteId: 't-fasttrack', sectionId: 'ts-ft-1', title: 'Analysis', description: '', hours: 20, storyPoints: 0, sortOrder: 0 },
  { id: 'tli-ft-2', quoteId: 't-fasttrack', sectionId: 'ts-ft-1', title: 'Deployment', description: '', hours: 24, storyPoints: 0, sortOrder: 1 },
  { id: 'tli-ft-3', quoteId: 't-fasttrack', sectionId: 'ts-ft-1', title: 'UAT support', description: '', hours: 8, storyPoints: 0, sortOrder: 2 },
  { id: 'tli-ft-4', quoteId: 't-fasttrack', sectionId: 'ts-ft-1', title: 'Technical design', description: '', hours: 10, storyPoints: 0, sortOrder: 3 },
  { id: 'tli-ft-5', quoteId: 't-fasttrack', sectionId: 'ts-ft-1', title: 'Testing', description: '', hours: 10, storyPoints: 0, sortOrder: 4 },
  { id: 'tli-ft-6', quoteId: 't-fasttrack', sectionId: 'ts-ft-1', title: 'Documentation', description: '', hours: 4, storyPoints: 0, sortOrder: 5 },
];