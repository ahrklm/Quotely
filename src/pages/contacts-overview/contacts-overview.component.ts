import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-contacts-overview',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
<div class="p-6 md:p-10 space-y-8">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <h1 class="text-3xl font-bold text-[#0800B9]">Contacts</h1>
    <button (click)="createNewContact()" class="bg-[#0800B9] text-white font-bold py-2 px-5 rounded-full hover:opacity-90 transition-opacity shadow-lg">
      + New Contact
    </button>
  </div>

  <!-- Table Container -->
  <div class="bg-white rounded-lg border border-slate-200/80 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left text-slate-600">
        <thead class="text-xs text-white uppercase bg-[#0800B9] font-bold">
          <tr>
            <th scope="col" class="px-6 py-4">Name</th>
            <th scope="col" class="px-6 py-4">Email</th>
            <th scope="col" class="px-6 py-4">Note</th>
            <th scope="col" class="px-6 py-4">Updated</th>
          </tr>
        </thead>
        <tbody>
          @for (contact of contacts(); track contact.id) {
            <tr (click)="viewContact(contact.id)" class="bg-white border-b border-slate-200/80 hover:bg-slate-50/80 transition-colors cursor-pointer">
              <td class="px-6 py-4 font-bold text-slate-800">
                {{ contact.name }}
              </td>
              <td class="px-6 py-4">{{ contact.email }}</td>
              <td class="px-6 py-4 italic text-slate-500">{{ contact.note }}</td>
              <td class="px-6 py-4">{{ contact.updatedAt | date:'yyyy-MM-dd' }}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="4" class="text-center py-10 text-slate-500">
                <p>No contacts found. Click "New Contact" to get started.</p>
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
export class ContactsOverviewComponent {
  dataService = inject(DataService);
  router = inject(Router);

  contacts = computed(() => {
    return this.dataService.contacts()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  });

  viewContact(id: string): void {
    this.router.navigate(['/contact', id]);
  }

  createNewContact(): void {
    this.router.navigate(['/contact', 'new']);
  }
}