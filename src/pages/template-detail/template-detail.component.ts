import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { DataService } from '../../services/data.service';
import { IconService } from '../../services/icon.service';
import { ToastService } from '../../services/toast.service';
import { Quote, QuoteLineItem, QuoteSection } from '../../models/types';

interface SectionWithItems extends QuoteSection {
  items: QuoteLineItem[];
}

@Component({
  selector: 'app-template-detail',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    RouterLink,
    CdkDropListGroup, CdkDropList, CdkDrag, CdkDragHandle,
  ],
  templateUrl: './template-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.meta.s)': 'onSave($event)',
    '(document:keydown.control.s)': 'onSave($event)',
  },
})
export class TemplateDetailComponent {
  // --- Injected Services ---
  route = inject(ActivatedRoute);
  router = inject(Router);
  dataService = inject(DataService);
  iconService = inject(IconService);
  toastService = inject(ToastService);

  // --- Component State Signals ---
  template = signal<Quote | null>(null);
  sections = signal<QuoteSection[]>([]);
  lineItems = signal<QuoteLineItem[]>([]);
  
  activeTab = signal<'estimation' | 'details'>('estimation');
  selectedLineItem = signal<QuoteLineItem | null>(null);

  // --- Quick Add Form State ---
  newTaskTitle = signal('');
  newTaskHours = signal(0);
  newTaskSectionId = signal<string | undefined>(undefined);
  
  // --- Edit Drawer State ---
  isDrawerOpen = computed(() => !!this.selectedLineItem());

  // --- Derived State (Computed Signals) ---
  totalHours = computed(() => this.lineItems().reduce((sum, item) => sum + item.hours, 0));
  totalPrice = computed(() => this.totalHours() * (this.template()?.pricePerHour || 0));

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

    sectionsMap.forEach(section => section.items.sort((a,b) => a.sortOrder - b.sortOrder));
    
    return Array.from(sectionsMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  });
  
  constructor() {
    this.route.paramMap.subscribe(params => {
      const templateId = params.get('id');
      if (templateId) {
        if (templateId === 'new') {
          const { template, sections } = this.dataService.createBlankTemplate();
          this.template.set(template);
          this.sections.set(sections);
          this.lineItems.set([]);
          this.newTaskSectionId.set(sections[0]?.id);
        } else {
          this.loadTemplateData(templateId);
        }
      }
    });
  }

  loadTemplateData(id: string): void {
    const template = this.dataService.getTemplateById(id);
    if (template) {
      this.template.set({ ...template });
      this.sections.set([...this.dataService.getSectionsForQuote(id)]);
      this.lineItems.set([...this.dataService.getLineItemsForQuote(id)]);
      this.newTaskSectionId.set(this.sections()[0]?.id);
    } else {
      this.router.navigate(['/templates']);
    }
  }

  // --- UI Methods ---
  setActiveTab(tab: 'estimation' | 'details'): void {
    this.activeTab.set(tab);
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
    this.lineItems.set([...this.lineItems()]);
  }
  
  // --- CRUD Methods ---
  addNewTask(): void {
    if (!this.newTaskTitle()) return;
    const template = this.template();
    if (!template) return;
    
    const sectionId = this.newTaskSectionId() || this.sections()[0]?.id;
    if (!sectionId) return;

    const itemsInSection = this.lineItems().filter(li => li.sectionId === sectionId);
    
    const newLineItem: QuoteLineItem = {
      id: `li-t-${Date.now()}`,
      quoteId: template.id,
      sectionId: sectionId,
      title: this.newTaskTitle(),
      description: '',
      hours: this.newTaskHours() || 0,
      storyPoints: 0,
      sortOrder: itemsInSection.length,
    };

    this.lineItems.update(items => [...items, newLineItem]);
    this.newTaskTitle.set('');
    this.newTaskHours.set(0);
  }

  addNewSection(): void {
    const template = this.template();
    if (!template) return;
    const newSection: QuoteSection = {
      id: `s-t-${Date.now()}`,
      quoteId: template.id,
      title: 'New Phase',
      sortOrder: this.sections().length,
    };
    this.sections.update(sections => [...sections, newSection]);
  }

  deleteLineItem(itemId: string): void {
    this.lineItems.update(items => items.filter(item => item.id !== itemId));
    if (this.selectedLineItem()?.id === itemId) {
        this.closeDrawer();
    }
  }

  // --- Drawer Methods ---
  openDrawer(item: QuoteLineItem): void {
    this.selectedLineItem.set({ ...item });
  }

  closeDrawer(): void {
    this.selectedLineItem.set(null);
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
  onSave(event: KeyboardEvent) {
    if (this.isDrawerOpen()) {
        return;
    }
    event.preventDefault();
    this.saveAllChanges();
  }
  
  saveAllChanges(): void {
    const currentTemplate = this.template();
    if (!currentTemplate) return;

    const updatedTemplateWithTotals = {
        ...currentTemplate,
        totalHours: this.totalHours(),
        totalPrice: this.totalPrice(),
        updatedAt: new Date().toISOString().split('T')[0],
    };
    
    this.template.set(updatedTemplateWithTotals);

    this.dataService.saveTemplateDetails(
        updatedTemplateWithTotals, 
        this.sections(), 
        this.lineItems()
    );
    
    this.toastService.showToast('Template saved successfully!', 'success');
    this.router.navigate(['/templates']);
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