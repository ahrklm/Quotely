
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DataService } from '../../services/data.service';
import { IconService } from '../../services/icon.service';
import { ToastService } from '../../services/toast.service';
import { Contact } from '../../models/types';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
@if (contact(); as c) {
  <div class="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
    <!-- Header -->
    <div>
      <a routerLink="/contacts" class="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 mb-2">
        <div [innerHTML]="iconService.getIcon('ChevronLeft')"></div>
        back
      </a>
      <h1 class="text-3xl font-bold text-[#0800B9]">
        @if (isNewContact()) {
          Create New Contact
        } @else {
          Contact: {{ c.name }}
        }
      </h1>
    </div>

    <!-- Form -->
    <div class="bg-white p-8 rounded-lg border border-slate-200/80 shadow-sm space-y-6">
      <h3 class="text-xl font-bold text-slate-800">Contact info</h3>
      
      <label class="block">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Name</span>
        <input 
          type="text" 
          [(ngModel)]="c.name"
          class="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
      </label>

      <label class="block">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</span>
        <input 
          type="email" 
          [(ngModel)]="c.email"
          class="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
      </label>

      <label class="block">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Note</span>
        <textarea 
          [(ngModel)]="c.note" 
          rows="4" 
          class="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </label>

      <div class="flex items-center justify-end gap-4 pt-4 border-t border-slate-200/80">
        @if (!isNewContact()) {
          <button (click)="deleteContact()" class="text-sm font-bold text-red-600 hover:text-red-800 transition-colors mr-auto">
            Delete Contact
          </button>
        }
        <button (click)="saveContact()" class="bg-[#0800B9] text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-lg">
          Save Contact
        </button>
      </div>
    </div>
  </div>
} @else {
  <div class="p-10 text-center">
    <p class="text-slate-500">Loading contact...</p>
  </div>
}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDetailComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  dataService = inject(DataService);
  iconService = inject(IconService);
  toastService = inject(ToastService);

  contact = signal<Contact | null>(null);
  isNewContact = signal(false);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const contactId = params.get('id');
      if (contactId) {
        if (contactId === 'new') {
          this.isNewContact.set(true);
          this.contact.set(this.dataService.createBlankContact());
        } else {
          this.isNewContact.set(false);
          const existingContact = this.dataService.getContactById(contactId);
          if (existingContact) {
            this.contact.set({ ...existingContact });
          } else {
            this.toastService.showToast('Contact not found.', 'danger');
            this.router.navigate(['/contacts']);
          }
        }
      }
    });
  }

  saveContact(): void {
    const currentContact = this.contact();
    if (currentContact && currentContact.name && currentContact.email) {
      this.dataService.saveContact(currentContact);
      this.toastService.showToast('Contact saved successfully!', 'success');
      this.router.navigate(['/contacts']);
    } else {
      this.toastService.showToast('Contact name and email are required.', 'danger');
    }
  }

  deleteContact(): void {
    const currentContact = this.contact();
    if (currentContact && !this.isNewContact()) {
      if (confirm('Are you sure you want to delete this contact? This cannot be undone.')) {
        const wasDeleted = this.dataService.deleteContact(currentContact.id);
        if (wasDeleted) {
          this.toastService.showToast('Contact deleted successfully!', 'success');
          this.router.navigate(['/contacts']);
        } else {
          this.toastService.showToast('Could not delete contact. It is linked to one or more quotes.', 'danger');
        }
      }
    }
  }
}
