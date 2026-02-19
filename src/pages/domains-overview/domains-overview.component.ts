import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-domains-overview',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe],
  template: `
<div class="p-6 md:p-10 space-y-8">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <h1 class="text-3xl font-bold text-[#0800B9]">Business Domains</h1>
    <button (click)="createNewDomain()" class="bg-[#0800B9] text-white font-bold py-2 px-5 rounded-full hover:opacity-90 transition-opacity shadow-lg">
      + New Domain
    </button>
  </div>

  <!-- Table Container -->
  <div class="bg-white rounded-lg border border-slate-200/80 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left text-slate-600">
        <thead class="text-xs text-white uppercase bg-[#0800B9] font-bold">
          <tr>
            <th scope="col" class="px-6 py-4">Name</th>
            <th scope="col" class="px-6 py-4">Hourly Rate</th>
            <th scope="col" class="px-6 py-4">Created By</th>
            <th scope="col" class="px-6 py-4">Updated</th>
          </tr>
        </thead>
        <tbody>
          @for (domain of domains(); track domain.id) {
            <tr (click)="viewDomain(domain.id)" class="bg-white border-b border-slate-200/80 hover:bg-slate-50/80 transition-colors cursor-pointer">
              <td class="px-6 py-4 font-bold text-slate-800">
                {{ domain.name }}
              </td>
              <td class="px-6 py-4 font-bold">{{ domain.hourlyRate | currency:'EUR':'symbol' }}</td>
              <td class="px-6 py-4">{{ domain.createdBy }}</td>
              <td class="px-6 py-4">{{ domain.updatedAt | date:'yyyy-MM-dd' }}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4" class="text-center py-10 text-slate-500">
                <p>No domains found. Click "New Domain" to get started.</p>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DomainsOverviewComponent {
  dataService = inject(DataService);
  router = inject(Router);

  domains = computed(() => {
    return this.dataService.domains()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  });

  viewDomain(id: string): void {
    this.router.navigate(['/domain', id]);
  }

  createNewDomain(): void {
    this.router.navigate(['/domain', 'new']);
  }
}