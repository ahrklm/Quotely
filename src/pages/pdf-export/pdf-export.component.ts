
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe, NgOptimizedImage } from '@angular/common';

import { DataService } from '../../services/data.service';
import { IconService } from '../../services/icon.service';
import { ToastService } from '../../services/toast.service';
import { Quote, QuoteLineItem, QuoteSection } from '../../models/types';
import { AFKL_LOGO_URL } from '../../assets/assets';

interface SectionWithItems extends QuoteSection {
  items: QuoteLineItem[];
}

@Component({
  selector: 'app-pdf-export',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgOptimizedImage],
  templateUrl: './pdf-export.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfExportComponent {
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

  AFKL_LOGO_URL = AFKL_LOGO_URL;

  // --- Derived State (Computed Signals) ---
  contactName = computed(() => {
    const cId = this.quote()?.contactId;
    return cId ? this.dataService.getContactById(cId)?.name : 'Authorized Lead';
  });
  
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
      const quoteId = params.get('id');
      if (quoteId) {
        const quote = this.dataService.getQuoteById(quoteId);
        if (quote) {
          this.quote.set(quote);
          this.sections.set(this.dataService.getSectionsForQuote(quoteId));
          this.lineItems.set(this.dataService.getLineItemsForQuote(quoteId));
        } else {
          this.toastService.showToast('Quote not found.', 'danger');
          this.router.navigate(['/']);
        }
      }
    });
  }

  saveAsPdf(): void {
    window.print();
  }
}