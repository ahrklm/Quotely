
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe,KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { DataService } from '../../services/data.service';
import { IconService } from '../../services/icon.service';
import { ToastService } from '../../services/toast.service';
import { BusinessDomain, Contact, Project, Quote, QuoteLineItem, QuoteSection, QuoteStatus } from '../../models/types';

interface SectionWithItems extends QuoteSection {
  items: QuoteLineItem[];
}

@Component({
  selector: 'app-quote-detail',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    RouterLink,
    CdkDropListGroup, CdkDropList, CdkDrag, CdkDragHandle,
    KeyValuePipe
],
  templateUrl: './quote-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.meta.s)': 'onSave($event)',
    '(document:keydown.control.s)': 'onSave($event)',
    '(document:keydown.meta.shift.s)': 'onAddNewSection($event)',
    '(document:keydown.control.shift.s)': 'onAddNewSection($event)',
  },
})
export class QuoteDetailComponent {
  // --- Injected Services ---
  route = inject(ActivatedRoute);
  router = inject(Router);
  dataService = inject(DataService);
  iconService = inject(IconService);
  toastService = inject(ToastService);

  // --- Component State Signals ---
  quote = signal<Quote | null>(null);
  sections = signal<QuoteSection[]>([]);
  lineItems = signal<QuoteLineItem[]>([]);
  
  activeTab = signal<'estimation' | 'details'>('estimation');
  selectedLineItem = signal<QuoteLineItem | null>(null);
  isSectionsDrawerOpen = signal(false);
  editingSectionId = signal<string | null>(null);

  // --- Quick Add Form State ---
  newTaskTitle = signal('');
  newTaskHours = signal(0);
  newTaskSectionId = signal<string | undefined>(undefined);
  
  // --- Edit Drawer State ---
  isDrawerOpen = computed(() => !!this.selectedLineItem());

  // --- Data References ---
  allProjects = this.dataService.projects;
  allContacts = this.dataService.contacts;
  allDomains = this.dataService.domains;
  allStatuses = Object.values(QuoteStatus);

  // --- Derived State (Computed Signals) ---
  selectedDomain = computed(() => {
    const domainId = this.quote()?.businessDomainId;
    if (!domainId) return null;
    return this.dataService.getDomainById(domainId);
  });

  projectName = computed(() => {
    const pId = this.quote()?.projectId;
    return pId ? this.dataService.getProjectById(pId)?.name : 'Internal Project';
  });

  // Client-facing totals (only visible items)
  totalHours = computed(() => {
    const visibleSections = this.sections().filter(s => !s.isHidden);
    const visibleSectionIds = new Set(visibleSections.map(s => s.id));
    const firstVisibleSectionId = visibleSections[0]?.id;

    return this.lineItems()
      .filter(item => {
        const sectionId = item.sectionId ?? firstVisibleSectionId;
        return sectionId ? visibleSectionIds.has(sectionId) : false;
      })
      .reduce((sum, item) => sum + item.hours, 0);
  });
  totalPrice = computed(() => this.totalHours() * (this.quote()?.pricePerHour || 0));

  // Internal totals (all items)
  internalTotalHours = computed(() => this.lineItems().reduce((sum, item) => sum + item.hours, 0));
  internalTotalPrice = computed(() => this.internalTotalHours() * (this.quote()?.pricePerHour || 0));

  isEditable = computed(() => {
    const status = this.quote()?.status;
    return status === QuoteStatus.DRAFT || status === QuoteStatus.SHARED;
  });

  sectionsWithItems = computed<SectionWithItems[]>(() => {
    const sectionsMap = new Map<string, SectionWithItems>();
    this.sections().forEach(sec => {
      sectionsMap.set(sec.id, { ...sec, items: [] });
    });

    this.lineItems().forEach(item => {
      const sectionId = item.sectionId ?? this.sections()[0]?.id; // Fallback to first section
      if (sectionId && sectionsMap.has(sectionId)) {
        sectionsMap.get(sectionId)!.items.push(item);
      }
    });

    // Sort items within each section
    sectionsMap.forEach(section => section.items.sort((a,b) => a.sortOrder - b.sortOrder));
    
    return Array.from(sectionsMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  });
  
  constructor() {
    this.route.paramMap.subscribe(params => {
      const quoteId = params.get('id');
      if (quoteId) {
        if (quoteId === 'new') {
          const { quote, sections } = this.dataService.createBlankQuote();
          this.quote.set(quote);
          this.sections.set(sections);
          this.lineItems.set([]);
          this.newTaskSectionId.set(sections[0]?.id);
        } else {
          this.loadQuoteData(quoteId);
        }
      }
    });
  }

  loadQuoteData(id: string): void {
    const quote = this.dataService.getQuoteById(id);
    if (quote) {
      this.quote.set({ ...quote });
      this.sections.set([...this.dataService.getSectionsForQuote(id)]);
      this.lineItems.set([...this.dataService.getLineItemsForQuote(id)]);
      this.newTaskSectionId.set(this.sections()[0]?.id);
    } else {
      this.router.navigate(['/quotes']);
    }
  }

  // --- UI Methods ---

  setActiveTab(tab: 'estimation' | 'details'): void {
    this.activeTab.set(tab);
  }

  getStatusClass(status: QuoteStatus): string {
    // Re-using logic from overview
    const classes: Record<QuoteStatus, string> = {
      [QuoteStatus.APPROVED]: 'bg-green-100 text-green-700',
      [QuoteStatus.WAITING]: 'bg-amber-100 text-amber-700',
      [QuoteStatus.SHARED]: 'bg-blue-100 text-blue-700',
      [QuoteStatus.DRAFT]: 'bg-slate-200 text-slate-600',
      [QuoteStatus.CANCELED]: 'bg-red-100 text-red-700',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  // --- Drag and Drop Handlers ---

  dropSection(event: CdkDragDrop<SectionWithItems[]>) {
    const sections = this.sections();
    moveItemInArray(sections, event.previousIndex, event.currentIndex);
    this.sections.set(this.updateSortOrder(sections));
  }

  dropTask(event: CdkDragDrop<QuoteLineItem[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updateLineItemSortOrder(event.container.data);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      const newSectionId = event.container.id;
      event.container.data[event.currentIndex].sectionId = newSectionId;

      this.updateLineItemSortOrder(event.previousContainer.data);
      this.updateLineItemSortOrder(event.container.data);
    }
    this.lineItems.set([...this.lineItems()]); // Trigger signal update
  }
  
  // --- CRUD Methods ---

  addNewTask(): void {
    if (!this.newTaskTitle().trim()) {
      this.toastService.showToast('Task title is required.', 'danger');
      return;
    }
    const quote = this.quote();
    if (!quote) return;
    
    const sectionId = this.newTaskSectionId() || this.sections()[0]?.id;
    if (!sectionId) {
       this.toastService.showToast('Cannot add task: No section available.', 'danger');
       return;
    }

    const itemsInSection = this.lineItems().filter(li => li.sectionId === sectionId);
    
    const newLineItem: QuoteLineItem = {
      id: `li${Date.now()}`,
      quoteId: quote.id,
      sectionId: sectionId,
      title: this.newTaskTitle().trim(),
      description: '',
      hours: this.newTaskHours() || 0,
      storyPoints: 0,
      sortOrder: itemsInSection.length,
    };

    this.lineItems.update(items => [...items, newLineItem]);
    this.newTaskTitle.set('');
    this.newTaskHours.set(0);
  }

  addTaskOnEnter(): void {
    if (this.newTaskTitle().trim()) {
      this.addNewTask();
    }
  }

  addNewSection(): void {
    const quote = this.quote();
    if (!quote) return;
    const newSection: QuoteSection = {
      id: `s${Date.now()}`,
      quoteId: quote.id,
      title: 'New Section',
      sortOrder: this.sections().length,
      isHidden: false,
    };
    this.sections.update(sections => [...sections, newSection]);
  }

  deleteSection(sectionId: string): void {
    const itemsInSection = this.lineItems().filter(item => item.sectionId === sectionId);

    if (itemsInSection.length > 0) {
      const generalSection = this.sections().find(s => s.title.toLowerCase() === 'general' && s.id !== sectionId);
      if (!generalSection) {
        this.toastService.showToast('Cannot delete a section with items without a "General" section to move them to.', 'danger');
        return;
      }

      // Move items to general section
      this.lineItems.update(items => {
          return items.map(item => {
              if (item.sectionId === sectionId) {
                  item.sectionId = generalSection.id;
              }
              return item;
          });
      });
    }

    this.sections.update(sections => sections.filter(s => s.id !== sectionId));
    this.toastService.showToast('Section deleted successfully.', 'success');
  }

  deleteLineItem(itemId: string): void {
    this.lineItems.update(items => items.filter(item => item.id !== itemId));
    if (this.selectedLineItem()?.id === itemId) {
        this.closeDrawer();
    }
  }

  onDomainChange(newDomainId: string): void {
    const selectedDomain = this.dataService.getDomainById(newDomainId);
    this.quote.update(q => {
      if (!q) return null;
      const newRate = selectedDomain ? selectedDomain.hourlyRate : q.pricePerHour;
      return {
        ...q,
        businessDomainId: newDomainId,
        pricePerHour: newRate,
      };
    });
  }

  // --- Drawer Methods ---
  
  openDrawer(item: QuoteLineItem): void {
    this.selectedLineItem.set({ ...item });
  }

  closeDrawer(): void {
    this.selectedLineItem.set(null);
  }
  
  openSectionsDrawer(): void {
    this.isSectionsDrawerOpen.set(true);
  }
  
  closeSectionsDrawer(): void {
    this.isSectionsDrawerOpen.set(false);
  }

  startEditingSection(sectionId: string): void {
    if (!this.isEditable()) return;
    this.editingSectionId.set(sectionId);
    setTimeout(() => {
      const inputEl = document.querySelector<HTMLInputElement>(`#section-input-${sectionId}`);
      inputEl?.focus();
      inputEl?.select();
    });
  }

  saveSectionTitle(section: QuoteSection, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.sections.update(sections => {
      const sec = sections.find(s => s.id === section.id);
      if (sec) {
        sec.title = input.value;
      }
      return [...sections];
    });
    this.editingSectionId.set(null);
  }
  
  toggleSectionVisibility(section: QuoteSection): void {
    this.sections.update(sections => {
      const sec = sections.find(s => s.id === section.id);
      if (sec) {
        sec.isHidden = !sec.isHidden;
      }
      return [...sections];
    });
  }

  updateSelectedLineItem(field: keyof QuoteLineItem, value: any): void {
    this.selectedLineItem.update(item => {
        if (!item) return null;
        return { ...item, [field]: value };
    });
  }

  applyDrawerChanges(): void {
    const updatedItem = this.selectedLineItem();
    if (updatedItem) {
      this.lineItems.update(items => {
        const index = items.findIndex(i => i.id === updatedItem.id);
        if (index > -1) {
          items[index] = updatedItem;
        }
        return [...items];
      });
      this.closeDrawer();
    }
  }

  // --- Persistence ---

  onAddNewSection(event: KeyboardEvent) {
    if (this.activeTab() !== 'estimation') return;
    event.preventDefault();
    this.addNewSection();
    this.toastService.showToast('New section added', 'info');
  }

  onSave(event: KeyboardEvent) {
    if (this.isDrawerOpen() || this.isSectionsDrawerOpen()) {
        return;
    }
    event.preventDefault();
    this.saveAllChanges();
  }

  saveAllChanges(): void {
    const currentQuote = this.quote();
    if (!currentQuote) return;

    // Recalculate totals before saving
    const updatedQuoteWithTotals = {
        ...currentQuote,
        totalHours: this.totalHours(),
        totalPrice: this.totalPrice(),
        updatedAt: new Date().toISOString().split('T')[0],
    };
    
    this.quote.set(updatedQuoteWithTotals);

    this.dataService.saveQuoteDetails(
        updatedQuoteWithTotals, 
        this.sections(), 
        this.lineItems()
    );
    
    this.toastService.showToast('Quote saved successfully!', 'success');
  }
  
  previewClientLink(): void {
    const token = this.quote()?.shareToken;
    if (token) {
      this.router.navigate(['/client', token]);
    } else {
      this.toastService.showToast('Could not generate link: share token is missing.', 'danger');
    }
  }

  exportToPdf(): void {
    const id = this.quote()?.id;
    if (id) {
      const url = `#/export/pdf/${id}`;
      window.open(url, '_blank');
    } else {
      this.toastService.showToast('Could not generate PDF link: quote ID is missing.', 'danger');
    }
  }

  // --- Private Helpers ---
  
  private updateSortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
    return items.map((item, index) => ({ ...item, sortOrder: index }));
  }

  private updateLineItemSortOrder(items: QuoteLineItem[]): void {
    const reorderedItems = this.updateSortOrder(items);
    this.lineItems.update(currentItems => {
        const itemIdsToUpdate = new Set(reorderedItems.map(i => i.id));
        const otherItems = currentItems.filter(i => !itemIdsToUpdate.has(i.id));
        return [...otherItems, ...reorderedItems];
    });
  }
}
