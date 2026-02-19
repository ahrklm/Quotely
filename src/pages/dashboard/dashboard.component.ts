import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { DataService } from '../../services/data.service';
import { IconService } from '../../services/icon.service';
import { QuoteStatus } from '../../models/types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  dataService = inject(DataService);
  iconService = inject(IconService);
  // FIX: Explicitly type Router to resolve type inference issue.
  router: Router = inject(Router);

  // --- KPIs ---
  kpi_totalQuotes = computed(() => this.dataService.quotes().length);
  kpi_approvedQuotes = computed(() => this.dataService.quotes().filter(q => q.status === QuoteStatus.APPROVED).length);
  kpi_pendingQuotes = computed(() => this.dataService.quotes().filter(q => q.status === QuoteStatus.WAITING).length);
  kpi_totalProjects = computed(() => this.dataService.projects().length);
  
  // --- Recent Quotes ---
  recentQuotes = computed(() => {
    return [...this.dataService.quotes()]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(quote => ({
        ...quote,
        projectName: this.dataService.getProjectName(quote.projectId),
      }));
  });

  // --- Methods ---
  getStatusClass(status: QuoteStatus): string {
    switch (status) {
      case QuoteStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case QuoteStatus.WAITING:
        return 'bg-amber-100 text-amber-800';
      case QuoteStatus.SHARED:
        return 'bg-blue-100 text-blue-800';
      case QuoteStatus.DRAFT:
        return 'bg-slate-100 text-slate-600';
      case QuoteStatus.CANCELED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  viewQuote(id: string): void {
    this.router.navigate(['/quote', id]);
  }
}