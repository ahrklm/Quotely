
import { Injectable, signal, computed } from '@angular/core';
import { initialContacts, initialDomains, initialLineItems, initialProjects, initialQuotes, initialSections, initialTemplates, initialTemplateSections, initialTemplateLineItems } from '../data/initial-data';
import { BusinessDomain, Contact, Project, Quote, QuoteLineItem, QuoteSection, SearchResult, QuoteStatus } from '../models/types';

@Injectable({ providedIn: 'root' })
export class DataService {
  // Signals for each data type
  private _quotes = signal<Quote[]>([]);
  private _projects = signal<Project[]>([]);
  private _contacts = signal<Contact[]>([]);
  private _domains = signal<BusinessDomain[]>([]);
  private _lineItems = signal<QuoteLineItem[]>([]);
  private _sections = signal<QuoteSection[]>([]);
  private _templates = signal<Quote[]>([]);
  
  // Public read-only signals
  public readonly quotes = this._quotes.asReadonly();
  public readonly projects = this._projects.asReadonly();
  public readonly contacts = this._contacts.asReadonly();
  public readonly domains = computed(() => {
    return this._domains().map(domain => {
      if (domain.rateComponents && domain.rateComponents.length > 0) {
        const calculatedRate = domain.rateComponents.reduce((sum, comp) => sum + (Number(comp.value) || 0), 0);
        // Only create a new object if the rate has changed to preserve identity and prevent unnecessary re-renders
        if (domain.hourlyRate !== calculatedRate) {
          return { ...domain, hourlyRate: calculatedRate };
        }
      }
      return domain;
    });
  });
  public readonly lineItems = this._lineItems.asReadonly();
  public readonly sections = this._sections.asReadonly();
  public readonly templates = this._templates.asReadonly();

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    // In a real app, this would be an HTTP call. Here we use localStorage.
    try {
      const storedQuotes = localStorage.getItem('quotely-quotes');
      if (storedQuotes) {
        this._quotes.set(JSON.parse(storedQuotes));
        this._projects.set(JSON.parse(localStorage.getItem('quotely-projects')!));
        this._contacts.set(JSON.parse(localStorage.getItem('quotely-contacts')!));
        this._domains.set(JSON.parse(localStorage.getItem('quotely-domains')!));
        this._lineItems.set(JSON.parse(localStorage.getItem('quotely-lineItems')!));
        this._sections.set(JSON.parse(localStorage.getItem('quotely-sections')!));
        this._templates.set(JSON.parse(localStorage.getItem('quotely-templates')!));
      } else {
        this.resetToInitialData();
      }
    } catch (e) {
      console.error('Failed to load data from localStorage', e);
      this.resetToInitialData();
    }
  }

  private resetToInitialData(): void {
    this._quotes.set(initialQuotes);
    this._projects.set(initialProjects);
    this._contacts.set(initialContacts);
    this._domains.set(initialDomains);
    // Combine standard line items with template line items
    this._lineItems.set([...initialLineItems, ...initialTemplateLineItems]);
    // Combine standard sections with template sections
    this._sections.set([...initialSections, ...initialTemplateSections]);
    this._templates.set(initialTemplates);
    this.saveData();
  }

  private saveData(): void {
    try {
      localStorage.setItem('quotely-quotes', JSON.stringify(this._quotes()));
      localStorage.setItem('quotely-projects', JSON.stringify(this._projects()));
      localStorage.setItem('quotely-contacts', JSON.stringify(this._contacts()));
      localStorage.setItem('quotely-domains', JSON.stringify(this._domains()));
      localStorage.setItem('quotely-lineItems', JSON.stringify(this._lineItems()));
      localStorage.setItem('quotely-sections', JSON.stringify(this._sections()));
      localStorage.setItem('quotely-templates', JSON.stringify(this._templates()));
    } catch (e) {
      console.error('Failed to save data to localStorage', e);
    }
  }
  
  // --- Data Access Helpers ---
  getProjectName(projectId: string): string {
    return this.projects().find(p => p.id === projectId)?.name || '-';
  }
  
  getProjectById(projectId: string): Project | undefined {
    return this.projects().find(p => p.id === projectId);
  }

  getContactName(contactId: string): string {
    return this.contacts().find(c => c.id === contactId)?.name || '-';
  }

  getContactById(contactId: string): Contact | undefined {
    return this.contacts().find(c => c.id === contactId);
  }

  getDomainById(domainId: string): BusinessDomain | undefined {
    return this.domains().find(d => d.id === domainId);
  }

  getQuoteById(id: string): Quote | undefined {
    return this.quotes().find(q => q.id === id);
  }
  
  getTemplateById(id: string): Quote | undefined {
    return this.templates().find(q => q.id === id);
  }

  getQuoteByShareToken(token: string): { quote: Quote, sections: QuoteSection[], lineItems: QuoteLineItem[] } | null {
    const quote = this.quotes().find(q => q.shareToken === token);
    if (!quote) {
      return null;
    }
    const sections = this.getSectionsForQuote(quote.id);
    const lineItems = this.getLineItemsForQuote(quote.id);
    return { quote, sections, lineItems };
  }

  getSectionsForQuote(quoteId: string): QuoteSection[] {
    return this.sections().filter(s => s.quoteId === quoteId).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getLineItemsForQuote(quoteId: string): QuoteLineItem[] {
    return this.lineItems().filter(li => li.quoteId === quoteId).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  createBlankQuote(): { quote: Quote, sections: QuoteSection[] } {
    const newQuoteId = `q${Date.now()}`;
    const newQuote: Quote = {
      id: newQuoteId,
      title: 'New Estimation',
      status: QuoteStatus.DRAFT,
      businessDomainId: '',
      projectId: '',
      contactId: '',
      pricePerHour: 100,
      totalHours: 0,
      totalPoints: 0,
      totalPrice: 0,
      description: '',
      requestDate: new Date().toISOString().split('T')[0],
      createdBy: 'Jon Snow',
      updatedAt: new Date().toISOString().split('T')[0],
      shareToken: `token-${newQuoteId}`,
    };

    // Every new quote must have a default "General" section to allow adding line items.
    const generalSection: QuoteSection = {
      id: `s${Date.now()}`,
      quoteId: newQuoteId,
      title: 'General',
      sortOrder: 0,
      isHidden: false,
    };
    
    this._quotes.update(quotes => [...quotes, newQuote]);
    this._sections.update(sections => [...sections, generalSection]);
    this.saveData();

    return { quote: newQuote, sections: [generalSection] };
  }
  
  createBlankTemplate(): { template: Quote, sections: QuoteSection[] } {
    const newTemplateId = `t-${Date.now()}`;
    const newTemplate: Quote = {
      id: newTemplateId,
      title: 'New Template',
      status: QuoteStatus.DRAFT,
      businessDomainId: '',
      projectId: '',
      contactId: '',
      pricePerHour: 100,
      totalHours: 0,
      totalPoints: 0,
      totalPrice: 0,
      description: 'A reusable template for future quotes.',
      requestDate: new Date().toISOString().split('T')[0],
      createdBy: 'Jon Snow',
      updatedAt: new Date().toISOString().split('T')[0],
      shareToken: `token-${newTemplateId}`,
    };
    const generalSection: QuoteSection = {
      id: `s-t-${Date.now()}`,
      quoteId: newTemplateId,
      title: 'General',
      sortOrder: 0,
      isHidden: false,
    };
    this._templates.update(templates => [...templates, newTemplate]);
    this._sections.update(sections => [...sections, generalSection]);
    this.saveData();
    return { template: newTemplate, sections: [generalSection] };
  }

  createQuoteFromTemplate(templateId: string): Quote | null {
    const template = this.getTemplateById(templateId);
    if (!template) return null;

    const templateSections = this.getSectionsForQuote(templateId);
    const templateLineItems = this.getLineItemsForQuote(templateId);
    
    const newQuoteId = `q${Date.now()}`;
    const newShareToken = `token-${newQuoteId}`;
    const today = new Date().toISOString().split('T')[0];

    // 1. Create the new Quote
    const newQuote: Quote = {
      ...template,
      id: newQuoteId,
      status: QuoteStatus.DRAFT,
      projectId: '',
      contactId: '',
      requestDate: today,
      updatedAt: today,
      shareToken: newShareToken
    };

    // 2. Deep copy sections and line items
    const sectionIdMap = new Map<string, string>();
    const newSections: QuoteSection[] = [];
    const newLineItems: QuoteLineItem[] = [];

    templateSections.forEach((section, index) => {
      const newSectionId = `s${Date.now() + index}`;
      sectionIdMap.set(section.id, newSectionId);
      newSections.push({
        ...section,
        id: newSectionId,
        quoteId: newQuoteId,
      });
    });

    templateLineItems.forEach((item, index) => {
      const newSectionId = item.sectionId ? sectionIdMap.get(item.sectionId) : undefined;
      newLineItems.push({
        ...item,
        id: `li${Date.now() + index}`,
        quoteId: newQuoteId,
        sectionId: newSectionId
      });
    });
    
    // 3. Update signals
    this._quotes.update(q => [...q, newQuote]);
    this._sections.update(s => [...s, ...newSections]);
    this._lineItems.update(li => [...li, ...newLineItems]);
    
    this.saveData();
    return newQuote;
  }
  
  duplicateQuote(quoteId: string): Quote | null {
    const originalQuote = this.getQuoteById(quoteId);
    if (!originalQuote) return null;

    const originalSections = this.getSectionsForQuote(quoteId);
    const originalLineItems = this.getLineItemsForQuote(quoteId);
    
    const newQuoteId = `q${Date.now()}`;
    const newShareToken = `token-${newQuoteId}`;
    const today = new Date().toISOString().split('T')[0];

    const newQuote: Quote = {
      ...originalQuote,
      id: newQuoteId,
      title: `${originalQuote.title} (Copy)`,
      status: QuoteStatus.DRAFT, // Always reset to draft
      requestDate: today,
      updatedAt: today,
      shareToken: newShareToken
    };

    const sectionIdMap = new Map<string, string>();
    const newSections: QuoteSection[] = [];
    const newLineItems: QuoteLineItem[] = [];

    originalSections.forEach((section, index) => {
      const newSectionId = `s${Date.now() + index}`;
      sectionIdMap.set(section.id, newSectionId);
      newSections.push({
        ...section,
        id: newSectionId,
        quoteId: newQuoteId,
      });
    });

    originalLineItems.forEach((item, index) => {
      const newSectionId = item.sectionId ? sectionIdMap.get(item.sectionId) : undefined;
      newLineItems.push({
        ...item,
        id: `li${Date.now() + index}`,
        quoteId: newQuoteId,
        sectionId: newSectionId
      });
    });
    
    this._quotes.update(q => [...q, newQuote]);
    this._sections.update(s => [...s, ...newSections]);
    this._lineItems.update(li => [...li, ...newLineItems]);
    
    this.saveData();
    return newQuote;
  }

  saveQuoteDetails(updatedQuote: Quote, updatedSections: QuoteSection[], updatedLineItems: QuoteLineItem[]): void {
    this._quotes.update(quotes => {
      const index = quotes.findIndex(q => q.id === updatedQuote.id);
      if (index > -1) {
        quotes[index] = updatedQuote;
      }
      return [...quotes];
    });

    this._sections.update(sections => {
      const otherSections = sections.filter(s => s.quoteId !== updatedQuote.id);
      return [...otherSections, ...updatedSections];
    });

    this._lineItems.update(lineItems => {
      const otherLineItems = lineItems.filter(li => li.quoteId !== updatedQuote.id);
      return [...otherLineItems, ...updatedLineItems];
    });

    this.saveData();
  }
  
  deleteQuote(quoteId: string): void {
    this._quotes.update(quotes => quotes.filter(q => q.id !== quoteId));
    this._sections.update(sections => sections.filter(s => s.quoteId !== quoteId));
    this._lineItems.update(lineItems => lineItems.filter(li => li.quoteId !== quoteId));
    this.saveData();
  }
  
  saveTemplateDetails(updatedTemplate: Quote, updatedSections: QuoteSection[], updatedLineItems: QuoteLineItem[]): void {
    this._templates.update(templates => {
      const index = templates.findIndex(t => t.id === updatedTemplate.id);
      if (index > -1) {
        templates[index] = updatedTemplate;
      } else {
        templates.push(updatedTemplate);
      }
      return [...templates];
    });

    this._sections.update(sections => {
      const otherSections = sections.filter(s => s.quoteId !== updatedTemplate.id);
      return [...otherSections, ...updatedSections];
    });

    this._lineItems.update(lineItems => {
      const otherLineItems = lineItems.filter(li => li.quoteId !== updatedTemplate.id);
      return [...otherLineItems, ...updatedLineItems];
    });

    this.saveData();
  }

  // --- Project CRUD ---
  createBlankProject(): Project {
    const newId = `p${Date.now()}`;
    return {
      id: newId,
      name: '',
      description: '',
      createdBy: 'Jon Snow',
      updatedAt: new Date().toISOString().split('T')[0],
    };
  }

  saveProject(projectToSave: Project): void {
    this._projects.update(projects => {
      const index = projects.findIndex(p => p.id === projectToSave.id);
      const updatedProject = { ...projectToSave, updatedAt: new Date().toISOString().split('T')[0] };
      if (index > -1) {
        projects[index] = updatedProject;
      } else {
        projects.push(updatedProject);
      }
      return [...projects];
    });
    this.saveData();
  }

  deleteProject(projectId: string): boolean {
    const isProjectUsed = this._quotes().some(q => q.projectId === projectId);
    if (isProjectUsed) {
      console.error('Cannot delete project: it is associated with one or more quotes.');
      return false;
    }
    this._projects.update(projects => projects.filter(p => p.id !== projectId));
    this.saveData();
    return true;
  }
  
  // --- Domain CRUD ---
  createBlankDomain(): BusinessDomain {
    const newId = `bd${Date.now()}`;
    return {
      id: newId,
      name: '',
      hourlyRate: 100,
      rateComponents: [],
      createdBy: 'Jon Snow',
      updatedAt: new Date().toISOString().split('T')[0],
    };
  }

  saveDomain(domainToSave: BusinessDomain): void {
    this._domains.update(domains => {
      const index = domains.findIndex(d => d.id === domainToSave.id);
      const updatedDomain = { ...domainToSave, updatedAt: new Date().toISOString().split('T')[0] };
      if (index > -1) {
        domains[index] = updatedDomain;
      } else {
        domains.push(updatedDomain);
      }
      return [...domains];
    });
    this.saveData();
  }

  deleteDomain(domainId: string): boolean {
    const isDomainUsed = this._quotes().some(q => q.businessDomainId === domainId);
    if (isDomainUsed) {
      console.error('Cannot delete domain: it is associated with one or more quotes.');
      return false;
    }
    this._domains.update(domains => domains.filter(d => d.id !== domainId));
    this.saveData();
    return true;
  }

  // --- Contact CRUD ---
  createBlankContact(): Contact {
    const newId = `c${Date.now()}`;
    return {
      id: newId,
      name: '',
      email: '',
      note: '',
      createdBy: 'Jon Snow',
      updatedAt: new Date().toISOString().split('T')[0],
    };
  }

  saveContact(contactToSave: Contact): void {
    this._contacts.update(contacts => {
      const index = contacts.findIndex(c => c.id === contactToSave.id);
      const updatedContact = { ...contactToSave, updatedAt: new Date().toISOString().split('T')[0] };
      if (index > -1) {
        contacts[index] = updatedContact;
      } else {
        contacts.push(updatedContact);
      }
      return [...contacts];
    });
    this.saveData();
  }

  deleteContact(contactId: string): boolean {
    const isContactUsed = this._quotes().some(q => q.contactId === contactId);
    if (isContactUsed) {
      console.error('Cannot delete contact: it is associated with one or more quotes.');
      return false;
    }
    this._contacts.update(contacts => contacts.filter(c => c.id !== contactId));
    this.saveData();
    return true;
  }

  performSearch(query: string): SearchResult[] {
    const lowerCaseQuery = query.toLowerCase();
    if (!lowerCaseQuery) return [];

    const results: SearchResult[] = [];
    const limit = 3;

    // Search Quotes
    this.quotes()
      .filter(q => q.title.toLowerCase().includes(lowerCaseQuery))
      .slice(0, limit)
      .forEach(q => results.push({
        id: q.id,
        type: 'Quote',
        label: q.title,
        route: `/quote/${q.id}`,
        iconName: 'Quotes',
        tags: [this.getProjectName(q.projectId)]
      }));

    // Search Templates
    this.templates()
      .filter(t => t.title.toLowerCase().includes(lowerCaseQuery))
      .slice(0, limit)
      .forEach(t => results.push({
        id: t.id,
        type: 'Template',
        label: t.title,
        route: `/template/${t.id}`,
        iconName: 'Template',
        tags: [t.description]
      }));

    // Search Projects
    this.projects()
      .filter(p => p.name.toLowerCase().includes(lowerCaseQuery) || p.description.toLowerCase().includes(lowerCaseQuery))
      .slice(0, limit)
      .forEach(p => results.push({
        id: p.id,
        type: 'Project',
        label: p.name,
        route: `/project/${p.id}`,
        iconName: 'Projects',
        tags: [p.description]
      }));

    // Search Domains
    this.domains()
      .filter(d => d.name.toLowerCase().includes(lowerCaseQuery))
      .slice(0, limit)
      .forEach(d => results.push({
        id: d.id,
        type: 'Domain',
        label: d.name,
        route: `/domain/${d.id}`,
        iconName: 'Domains',
        tags: [`Rate: ${d.hourlyRate}`]
      }));

    // Search Contacts
    this.contacts()
      .filter(c => c.name.toLowerCase().includes(lowerCaseQuery) || c.email.toLowerCase().includes(lowerCaseQuery))
      .slice(0, limit)
      .forEach(c => results.push({
        id: c.id,
        type: 'Contact',
        label: c.name,
        route: `/contact/${c.id}`,
        iconName: 'Contacts',
        tags: [c.email]
      }));
      
    return results;
  }
}