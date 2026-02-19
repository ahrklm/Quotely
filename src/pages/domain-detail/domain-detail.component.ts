
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DataService } from '../../services/data.service';
import { IconService } from '../../services/icon.service';
import { ToastService } from '../../services/toast.service';
import { BusinessDomain, RateComponent } from '../../models/types';

@Component({
  selector: 'app-domain-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
@if (domain(); as d) {
  <div class="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
    <!-- Header -->
    <div>
      <a routerLink="/domains" class="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 mb-2">
        <div [innerHTML]="iconService.getIcon('ChevronLeft')"></div>
        back
      </a>
      <h1 class="text-3xl font-bold text-[#0800B9]">
        @if (isNewDomain()) {
          Create New Domain
        } @else {
          Domain: {{ d.name }}
        }
      </h1>
    </div>

    <!-- Form -->
    <div class="bg-white p-8 rounded-lg border border-slate-200/80 shadow-sm space-y-6">
      <h3 class="text-xl font-bold text-slate-800">Domain settings</h3>
      
      <label class="block">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Name</span>
        <input 
          type="text" 
          [(ngModel)]="d.name"
          class="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
      </label>

      <label class="block">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Hourly Rate (€)</span>
        <input 
          type="number" 
          [(ngModel)]="d.hourlyRate"
          [readOnly]="d.rateComponents && d.rateComponents.length > 0"
          class="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          [class.bg-slate-100]="d.rateComponents && d.rateComponents.length > 0"
          [class.cursor-not-allowed]="d.rateComponents && d.rateComponents.length > 0"
        >
      </label>

      <!-- Breakdown Section -->
      <div class="space-y-4 pt-6 border-t border-slate-200/80">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold text-slate-800">Hourly Rate Breakdown</h3>
            <p class="text-sm text-slate-500 mt-1">
              Build the hourly rate from multiple cost components. The total will automatically update the field above.
            </p>
          </div>
          <button (click)="addRateComponent()" class="bg-blue-50 text-blue-700 font-bold py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm shrink-0">
            + Add Component
          </button>
        </div>

        @if(d.rateComponents && d.rateComponents.length > 0) {
          <div class="space-y-3 pt-2">
            <!-- Header -->
            <div class="flex items-center gap-3 px-2 text-xs font-bold text-slate-400 uppercase">
              <span class="flex-grow">Component Name</span>
              <span class="w-32 text-right">Amount (€)</span>
              <span class="w-10"></span>
            </div>
            <!-- Components List -->
            @for (component of d.rateComponents; track trackComponentById($index, component)) {
              <div class="flex items-center gap-3">
                <input 
                  type="text" 
                  [(ngModel)]="component.label"
                  (ngModelChange)="onRateComponentChange()"
                  placeholder="e.g., Base Cost, Overhead" 
                  class="flex-grow p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                <input 
                  type="number" 
                  [(ngModel)]="component.value"
                  (ngModelChange)="onRateComponentChange()"
                  class="w-32 p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm text-right"
                >
                <button (click)="removeRateComponent(component.id)" class="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                  <div [innerHTML]="iconService.getIcon('Trash')"></div>
                </button>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-6 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
            <p>No components added. Add one to start building the rate.</p>
          </div>
        }
      </div>

      <div class="flex items-center justify-end gap-4 pt-4 border-t border-slate-200/80">
        @if (!isNewDomain()) {
          <button (click)="deleteDomain()" class="text-sm font-bold text-red-600 hover:text-red-800 transition-colors mr-auto">
            Delete Domain
          </button>
        }
        <button (click)="cancel()" class="bg-slate-100 text-slate-700 font-bold py-2 px-6 rounded-lg hover:bg-slate-200 transition-colors">
            Cancel
        </button>
        <button (click)="saveDomain()" class="bg-[#0800B9] text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-lg">
          Save Domain
        </button>
      </div>
    </div>
  </div>
} @else {
  <div class="p-10 text-center">
    <p class="text-slate-500">Loading domain...</p>
  </div>
}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DomainDetailComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  dataService = inject(DataService);
  iconService = inject(IconService);
  toastService = inject(ToastService);

  domain = signal<BusinessDomain | null>(null);
  isNewDomain = signal(false);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const domainId = params.get('id');
      if (domainId) {
        if (domainId === 'new') {
          this.isNewDomain.set(true);
          this.domain.set(this.dataService.createBlankDomain());
        } else {
          this.isNewDomain.set(false);
          const existingDomain = this.dataService.getDomainById(domainId);
          if (existingDomain) {
            this.domain.set({ 
              ...existingDomain,
              rateComponents: existingDomain.rateComponents ?? []
            });
          } else {
            this.toastService.showToast('Domain not found.', 'danger');
            this.router.navigate(['/domains']);
          }
        }
      }
    });

    effect(() => {
        const currentDomain = this.domain();
        if (currentDomain?.rateComponents && currentDomain.rateComponents.length > 0) {
            const total = currentDomain.rateComponents.reduce((sum, comp) => sum + (Number(comp.value) || 0), 0);
            if (currentDomain.hourlyRate !== total) {
                this.domain.update(d => {
                    if (d) {
                       return { ...d, hourlyRate: total };
                    }
                    return d;
                });
            }
        }
    });
  }
  
  cancel(): void {
    this.router.navigate(['/domains']);
  }

  saveDomain(): void {
    const currentDomain = this.domain();
    if (currentDomain && currentDomain.name && currentDomain.hourlyRate >= 0) {
      this.dataService.saveDomain(currentDomain);
      this.toastService.showToast('Domain saved successfully!', 'success');
      this.router.navigate(['/domains']);
    } else {
      this.toastService.showToast('Domain name and a valid hourly rate are required.', 'danger');
    }
  }

  deleteDomain(): void {
    const currentDomain = this.domain();
    if (currentDomain && !this.isNewDomain()) {
      if (confirm('Are you sure you want to delete this domain? This cannot be undone.')) {
        const wasDeleted = this.dataService.deleteDomain(currentDomain.id);
        if (wasDeleted) {
          this.toastService.showToast('Domain deleted successfully!', 'success');
          this.router.navigate(['/domains']);
        } else {
          this.toastService.showToast('Could not delete domain. It is linked to one or more quotes.', 'danger');
        }
      }
    }
  }

  addRateComponent(): void {
    this.domain.update(d => {
        if (d) {
            const newComponents = [...(d.rateComponents || []), { id: `rc${Date.now()}`, label: '', value: 0 }];
            return { ...d, rateComponents: newComponents };
        }
        return d;
    });
  }

  onRateComponentChange(): void {
    // ngModel performs a deep mutation on an object inside our signal.
    // To make our effect aware of this change and recalculate the total,
    // we need to signal that the domain object has "changed".
    // Creating a shallow clone of the domain object is sufficient to trigger the effect.
    this.domain.update(d => (d ? { ...d } : null));
  }

  removeRateComponent(id: string): void {
    this.domain.update(d => {
        if (d && d.rateComponents) {
            const newComponents = d.rateComponents.filter(c => c.id !== id);
            return { ...d, rateComponents: newComponents };
        }
        return d;
    });
  }
  
  trackComponentById(index: number, item: RateComponent): string {
    return item.id;
  }
}