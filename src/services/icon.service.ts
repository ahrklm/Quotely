import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class IconService {
  // FIX: Explicitly type DomSanitizer to resolve type inference issue.
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  private icons: { [key: string]: string } = {
    Search: `<svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M27.41,24.59l-5.39-5.39a11,11,0,1,0-2.82,2.82l5.39,5.39ZM5,14a9,9,0,1,1,9,9A9,9,0,0,1,5,14Z"/></svg>`,
    Dashboard: `<svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M4 4h10v10H4V4zm2 2v6h6V6H6zm12-2h10v10H18V4zm2 2v6h6V6h-6zM4 18h10v10H4V18zm2 2v6h6v-6H6zm12 0h10v10H18V20zm2 2v6h6v-6h-6z"/></svg>`,
    Quotes: `<svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M25.7 9.3l-7-7c-.2-.2-.4-.3-.7-.3H8c-1.1 0-2 .9-2 2v24c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-.3-.1-.5-.3-.7zM18 4.4l5.6 5.6H18V4.4zM24 28H8V4h8v8h8v16z"/></svg>`,
    Projects: `<svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M28 8h-6V4a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v4H4a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM12 4h8v4h-8V4zm16 24H4V18h24v10zm0-12H4v-6h24v6z"/></svg>`,
    Domains: `<svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M26 4H6a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM6 26V6h20v20zM9 9h14v2H9zm0 6h14v2H9zm0 6h14v2H9z"/></svg>`,
    Contacts: `<svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M16,4a5,5,0,1,0,5,5,5,5,0,0,0-5-5Zm0,8a3,3,0,1,1,3-3,3,3,0,0,1-3,3Zm11,14v-2a6,6,0,0,0-6-6H10a6,6,0,0,0-6,6v2a2,2,0,0,0,2,2h18a2,2,0,0,0,2-2Zm-21.1,0A4,4,0,0,1,9.8,22h12.4a4,4,0,0,1,3.9,4Z"/></svg>`,
    Docs: `<svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M26,30H6a2,2,0,0,1-2-2V4a2,2,0,0,1,6,2H20l8,8V28A2,2,0,0,1,26,30ZM6,4V28H26V11H19V4H6ZM21,5.4,24.6,9H21ZM10,12h5v2H10Zm0,5h12v2H10Zm0,5h12v2H10Z"/></svg>`,
    Help: `<svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Zm-1-16.5A1.5,1.5,0,0,1,16.5,10h.09a2.5,2.5,0,0,1,2.41,2.41c0,2-2,2.59-2.5,3.09S15,16.42,15,17.5V19h2v-1.5c0-1.41.91-2.22,1.5-2.82s1-1.3,1-2.18A4.5,4.5,0,0,0,16.5,8,3.5,3.5,0,0,0,13,11.5v1h2Z"/><circle cx="16" cy="22.5" r="1.5"/></svg>`,
    ChevronLeft: `<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M10 16L20 6l1.4 1.4-8.6 8.6 8.6 8.6L20 26z"/></svg>`,
    ChevronRight: `<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M22 16L12 26l-1.4-1.4 8.6-8.6-8.6-8.6L12 6z"/></svg>`,
    Hamburger: `<svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor"><path d="M4 6h24v2H4zm0 9h24v2H4zm0 9h24v2H4z"/></svg>`,
    Close: `<svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor"><path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z"/></svg>`,
    Logout: `<svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor"><path d="M6,30H4a2,2,0,0,1-2-2V4A2,2,0,0,1,4,2H6V4H4V28H6ZM28,16,22,10V15H10v2H22v5Z"/></svg>`,
    Clock: `<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Z"/><path d="M16.5,8H15v9h8v-1.5H16.5Z"/></svg>`,
    Enter: `<svg width="12" height="12" viewBox="0 0 32 32" fill="currentColor"><path d="M26,16l-8-8v6H4v4h14v6l8-8Z"/></svg>`,
    Template: `<svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M28,4h-8V2h-8v2H4C2.9,4,2,4.9,2,6v22c0,1.1,0.9,2,2,2h24c1.1,0,2-.9,2-2V6C30,4.9,29.1,4,28,4z M28,28H4V6h8v2h8V6h8V28z M10,12h12v2H10V12z M10,18h12v2H10V18z M10,24h12v2H10V24z"/></svg>`,
    DotsMenu: `<svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><circle cx="8" cy="16" r="2"/><circle cx="16" cy="16" r="2"/><circle cx="24" cy="16" r="2"/></svg>`,
    Investment: `<svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor"><path d="M24.6,18.4l-8-8L16,10l-0.6-.4-4,4-1.4-1.4,4-4L14,8l-4-4-1.4,1.4,4,4-1.8,1.8-8.8-8.8-1.4,1.4L10,12l-4,4,1.4,1.4,4-4,0.6,0.4,4-4,1.4,1.4-4,4L14,16l4,4,1.4-1.4-4-4,1.8-1.8,8.8,8.8,1.4-1.4L22,18l4-4-1.4-1.4-4,4,0.6,0.4ZM6.6,14,4,16.6,2,14.6l2.6-2.6L2.8,10.2l1.4-1.4,1.8,1.8L10,6.6,12.6,4,28,19.4l-2.6,2.6L20,20.2l-1.8,1.8-4-4-2.6,2.6-2.6-2.6,1.8-1.8Z"/></svg>`,
    Effort: `<svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor"><path d="M16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Zm0,22A10,10,0,1,1,26,16,10,10,0,0,1,16,26Z"/><path d="M15,15.59V8h2v7.59l4.7,4.7-1.4,1.42Z"/></svg>`,
    Rate: `<svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor"><path d="M22,14a8,8,0,1,0,0,4A8,8,0,0,0,22,14Zm0,6a6,6,0,1,1,6-6A6,6,0,0,1,22,20Z"/><path d="M12,10a8,8,0,1,0-6,7.75V22H8V17.75A8,8,0,0,0,12,10ZM4,10a6,6,0,1,1,6,6A6,6,0,0,1,4,10Z"/><path d="M2,28V26H4.24A10,10,0,0,0,14,28Z"/><path d="M16,28a10,10,0,0,0,9.76-8H28v2Z"/></svg>`,
    Pencil: `<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M22.5,4c-1,0-1.9.4-2.6,1.1L7.2,17.8l-2.9,9.3c-.2.7,0,1.4.5,1.9s1.2.7,1.9.5l9.3-2.9L28.9,14c.7-.7,1.1-1.6,1.1-2.6s-.4-1.9-1.1-2.6l-3.7-3.7C24.4,4.4,23.5,4,22.5,4z M9.4,26.8L12,19.3l4.7,4.7L9.4,26.8z M27.5,12.6L16,24.1l-4.7-4.7L22.8,8.2c.2-.2.5-.2.7,0l3.7,3.7c.1.1.2.3.2.4s-.1.3-.2.4z"/></svg>`,
    Trash: `<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M12 4h8v2h-8z"/><path d="M6 8v20c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8H6zm4 18H8v-14h2v14zm4 0h-2v-14h2v14zm4 0h-2v-14h2v14zm4 0h-2v-14h2v14z"/><path d="M4 6h24v2H4z"/></svg>`,
    DragHandle: `<svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><circle cx="10" cy="8" r="2"/><circle cx="10" cy="16" r="2"/><circle cx="10" cy="24" r="2"/><circle cx="22" cy="8" r="2"/><circle cx="22" cy="16" r="2"/><circle cx="22" cy="24" r="2"/></svg>`,
    SealCheck: `<svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor"><path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm8.5,10.9-9,9a1,1,0,0,1-1.4,0l-5-5a1,1,0,1,1,1.4-1.4L15,20.1l8.3-8.3a1,1,0,0,1,1.4,1.4Z"/></svg>`,
    Download: `<svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M26,18v5H6V18H4v5a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2V18Z"/><path d="M16 22L6 12l1.4-1.4 7.6 7.6 7.6-7.6L24 12z"/><path d="M15 4h2v14h-2z"/></svg>`
  };

  getIcon(name: string): SafeHtml {
    const iconHtml = this.icons[name] || '';
    return this.sanitizer.bypassSecurityTrustHtml(iconHtml);
  }
}