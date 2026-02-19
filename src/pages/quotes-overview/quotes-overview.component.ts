
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { DataService } from '../../services/data.service';
import { IconService } from '../../services/icon.service';
import { ToastService } from '../../services/toast.service';
import { Quote, QuoteStatus } from '../../models/types';

interface DisplayQuote {
  id: string;
  title: string;
  status: QuoteStatus;
  projectName: string;
  contactName: string;
  totalPrice: number;
  updatedAt: string;
}

@Component({
  selector: 'app-quotes-overview',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink],
  templateUrl: './quotes-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'closePopover()',
  },
})
export class QuotesOverviewComponent {
  dataService = inject(DataService);
  iconService = inject(IconService);
  router = inject(Router);
  toastService = inject(ToastService);

  // --- State Signals ---
  searchTerm = signal('');
  currentPage = signal(1);
  itemsPerPage = signal(10);
  isTemplateModalOpen = signal(false);
  activePopoverId = signal<string | null>(null);

  // --- Data Signals ---
  templates = this.dataService.templates;

  // --- Derived Signals (Computed) ---
  private allDisplayQuotes = computed<DisplayQuote[]>(() => {
    return this.dataService.quotes()
      .map(quote => ({
        id: quote.id,
        title: quote.title,
        status: quote.status,
        projectName: this.dataService.getProjectName(quote.projectId),
        contactName: this.dataService.getContactName(quote.contactId),
        totalPrice: quote.totalPrice,
        updatedAt: quote.updatedAt,
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  });

  filteredQuotes = computed(() => {
    const lowerCaseSearch = this.searchTerm().toLowerCase();
    if (!lowerCaseSearch) {
      return this.allDisplayQuotes();
    }
    return this.allDisplayQuotes().filter(quote =>
      quote.title.toLowerCase().includes(lowerCaseSearch)
    );
  });
  
  paginatedQuotes = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredQuotes().slice(start, end);
  });

  totalPages = computed(() => Math.ceil(this.filteredQuotes().length / this.itemsPerPage()));

  pageInfo = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage() + 1;
    const end = Math.min(start + this.itemsPerPage() - 1, this.filteredQuotes().length);
    return `${start} - ${end} of ${this.filteredQuotes().length}`;
  });

  // --- Methods ---

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onItemsPerPageChange(event: Event): void {
    const count = +(event.target as HTMLSelectElement).value;
    this.itemsPerPage.set(count);
    this.currentPage.set(1);
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }
  
  viewQuote(id: string): void {
    this.router.navigate(['/quote', id]);
  }

  openCreateQuoteModal(): void {
    this.isTemplateModalOpen.set(true);
  }

  closeCreateQuoteModal(): void {
    this.isTemplateModalOpen.set(false);
  }
  
  createBlankQuote(): void {
    this.router.navigate(['/quote', 'new']);
    this.closeCreateQuoteModal();
  }
  
  createQuoteFromTemplate(templateId: string): void {
    const newQuote = this.dataService.createQuoteFromTemplate(templateId);
    if (newQuote) {
      this.router.navigate(['/quote', newQuote.id]);
      this.closeCreateQuoteModal();
    }
  }
  
  // --- Popover and Actions ---

  togglePopover(quoteId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activePopoverId.update(currentId => (currentId === quoteId ? null : quoteId));
  }

  closePopover(): void {
    this.activePopoverId.set(null);
  }

  previewQuote(quoteId: string, event: MouseEvent): void {
    event.stopPropagation();
    const quote = this.dataService.getQuoteById(quoteId);
    if (quote?.shareToken) {
      this.router.navigate(['/client', quote.shareToken]);
    } else {
      this.toastService.showToast('Could not generate preview link.', 'danger');
    }
    this.closePopover();
  }

  duplicateQuote(quoteId: string, event: MouseEvent): void {
    event.stopPropagation();
    const newQuote = this.dataService.duplicateQuote(quoteId);
    if (newQuote) {
      this.toastService.showToast(`'${newQuote.title}' created successfully.`, 'success');
      this.router.navigate(['/quote', newQuote.id]);
    } else {
      this.toastService.showToast('Failed to duplicate quote.', 'danger');
    }
    this.closePopover();
  }

  deleteQuote(quoteId: string, event: MouseEvent): void {
    event.stopPropagation();
    const quoteToDelete = this.dataService.getQuoteById(quoteId);
    if (quoteToDelete && confirm(`Are you sure you want to delete "${quoteToDelete.title}"?`)) {
      this.dataService.deleteQuote(quoteId);
      this.toastService.showToast('Quote deleted successfully.', 'success');
    }
    this.closePopover();
  }

  getStatusClass(status: QuoteStatus): string {
    switch (status) {
      case QuoteStatus.APPROVED:
        return 'bg-green-100 text-green-700';
      case QuoteStatus.WAITING:
        return 'bg-amber-100 text-amber-700';
      case QuoteStatus.SHARED:
        return 'bg-blue-100 text-blue-700';
      case QuoteStatus.DRAFT:
        return 'bg-slate-200 text-slate-600';
      case QuoteStatus.CANCELED:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
