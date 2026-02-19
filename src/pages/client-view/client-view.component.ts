
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DataService } from '../../services/data.service';
import { IconService } from '../../services/icon.service';
import { ToastService } from '../../services/toast.service';
import { Quote, QuoteLineItem, QuoteSection, QuoteStatus } from '../../models/types';
import { AFKL_LOGO_URL } from '../../assets/assets';

interface SectionWithItems extends QuoteSection {
  items: QuoteLineItem[];
}

@Component({
  selector: 'app-client-view',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgOptimizedImage, FormsModule],
  templateUrl: './client-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientViewComponent {
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
  isModalOpen = signal(false);
  epfmCode = signal('');

  AFKL_LOGO_URL = AFKL_LOGO_URL;

  // --- Derived State (Computed Signals) ---
  domain = computed(() => {
    const domainId = this.quote()?.businessDomainId;
    if (!domainId) return null;
    return this.dataService.getDomainById(domainId);
  });

  projectName = computed(() => {
    const pId = this.quote()?.projectId;
    return pId ? this.dataService.getProjectById(pId)?.name : 'Internal Project';
  });

  contactName = computed(() => {
    const cId = this.quote()?.contactId;
    if (!cId) {
      return null;
    }
    return this.dataService.getContactById(cId)?.name ?? null;
  });

  isApprovalAllowed = computed(() => {
    const status = this.quote()?.status;
    return status === QuoteStatus.SHARED || status === QuoteStatus.WAITING;
  });

  isEpfmValid = computed(() => /^\d{5}$/.test(this.epfmCode()));
  
  sectionsWithItems = computed<SectionWithItems[]>(() => {
    const sectionsMap = new Map<string, SectionWithItems>();
    this.sections().filter(s => !s.isHidden).forEach(sec => {
      sectionsMap.set(sec.id, { ...sec, items: [] });
    });

    this.lineItems().forEach(item => {
      const sectionId = item.sectionId ?? this.sections()[0]?.id;
      if (sectionId && sectionsMap.has(sectionId)) {
        sectionsMap.get(sectionId)!.items.push(item);
      }
    });
    
    return Array.from(sectionsMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  });

  constructor() {
    this.route.paramMap.subscribe(params => {
      const token = params.get('token');
      if (token) {
        const data = this.dataService.getQuoteByShareToken(token);
        if (data) {
          this.quote.set(data.quote);
          this.sections.set(data.sections);
          this.lineItems.set(data.lineItems);
        } else {
          this.toastService.showToast('Quote not found or token is invalid.', 'danger');
          this.router.navigate(['/']);
        }
      }
    });
  }

  // --- Modal & Approval Methods ---
  
  openModal(): void {
    if (this.isApprovalAllowed()) {
      this.isModalOpen.set(true);
    }
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.epfmCode.set('');
  }

  confirmApproval(): void {
    if (!this.isEpfmValid()) {
      this.toastService.showToast('Please enter a valid 5-digit EPFM code.', 'danger');
      return;
    }

    const currentQuote = this.quote();
    if (currentQuote && this.isApprovalAllowed()) {
      const updatedQuote = { 
        ...currentQuote, 
        status: QuoteStatus.APPROVED,
        updatedAt: new Date().toISOString().split('T')[0] 
      };
      
      this.dataService.saveQuoteDetails(updatedQuote, this.sections(), this.lineItems());
      this.quote.set(updatedQuote); // Update local state to reflect change
      
      this.toastService.showToast('Quote successfully approved!', 'success');
      this.closeModal();
    }
  }

  printPage(): void {
    window.print();
  }
}
