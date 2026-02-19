import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { DOCUMENT } from '@angular/common';
import { SearchModalComponent } from './components/search-modal/search-modal.component';
import { CommandModalComponent } from './components/command-modal/command-modal.component';
// Eagerly load some components that will be used.
import { DocumentationComponent } from './pages/documentation/documentation.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ContactsOverviewComponent } from './pages/contacts-overview/contacts-overview.component';
import { DomainsOverviewComponent } from './pages/domains-overview/domains-overview.component';
import { ProjectsOverviewComponent } from './pages/projects-overview/projects-overview.component';
import { QuotesOverviewComponent } from './pages/quotes-overview/quotes-overview.component';
import { TemplatesOverviewComponent } from './pages/templates-overview/templates-overview.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    ToastContainerComponent,
    SearchModalComponent,
    CommandModalComponent,
    DocumentationComponent,
    DashboardComponent,
    ContactsOverviewComponent,
    DomainsOverviewComponent,
    ProjectsOverviewComponent,
    QuotesOverviewComponent,
    TemplatesOverviewComponent
],
  template: `
    <div class="flex flex-col h-screen overflow-hidden">
      <app-header (mobileMenuToggle)="toggleMobileMenu()" />
      <div class="flex flex-1 overflow-hidden">
        <!-- Desktop Sidebar -->
        <aside [class]="'fixed top-[61px] left-0 h-[calc(100vh-61px)] z-50 transition-all duration-300 ease-in-out lg:flex hidden flex-col no-print ' + (isSidebarExpanded() ? 'w-56' : 'w-16')">
          <app-sidebar [isExpanded]="isSidebarExpanded()" (toggleExpanded)="toggleSidebar()" (searchOpen)="openSearch()" (commandModalOpen)="openCommandModal()" />
        </aside>
        
        <!-- Mobile Backdrop -->
        @if (isMobileMenuOpen()) {
          <div
            class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden transition-opacity animate-in fade-in"
            (click)="closeMobileMenu()"
          ></div>
        }
        
        <!-- Mobile Sidebar -->
        <aside [class]="'fixed left-0 top-0 h-screen z-[70] transition-all duration-300 ease-in-out lg:hidden flex flex-col w-64 shadow-2xl ' + (isMobileMenuOpen() ? 'translate-x-0' : '-translate-x-full')">
          <div class="absolute top-4 right-[-50px] lg:hidden">
             <button (click)="closeMobileMenu()" class="bg-white p-2 rounded-full shadow-lg text-blue-600">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor"><path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z"/></svg>
             </button>
          </div>
          <app-sidebar [isExpanded]="true" (navigated)="closeMobileMenu()" (searchOpen)="openSearch()" (commandModalOpen)="openCommandModal()" />
        </aside>

        <main [class]="'flex-1 overflow-y-auto bg-white transition-all duration-300 ' + (isSidebarExpanded() ? 'lg:pl-56' : 'lg:pl-16')">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-toast-container />
      <app-search-modal [isOpen]="isSearchOpen()" (close)="closeSearch()" />
      <app-command-modal [isOpen]="isCommandModalOpen()" (close)="closeCommandModal()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  isSidebarExpanded = signal<boolean>(true);
  isMobileMenuOpen = signal<boolean>(false);
  isSearchOpen = signal<boolean>(false);
  isCommandModalOpen = signal<boolean>(false);
  
  // FIX: Explicitly type Document to resolve type inference issue.
  private document: Document = inject(DOCUMENT);

  constructor() {
    this.loadInitialState();
    
    effect(() => {
        try {
            localStorage.setItem('quotely-sidebar-expanded', JSON.stringify(this.isSidebarExpanded()));
        } catch (e) {
            console.error('Failed to save sidebar state to localStorage', e);
        }
    });

    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            this.toggleSearchModal();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === '/') {
            e.preventDefault();
            this.toggleCommandModal();
        }
    });
  }

  private loadInitialState() {
    try {
        const savedState = localStorage.getItem('quotely-sidebar-expanded');
        if (savedState !== null) {
            this.isSidebarExpanded.set(JSON.parse(savedState));
        }
    } catch (e) {
        console.error('Failed to load sidebar state from localStorage', e);
        this.isSidebarExpanded.set(true);
    }
  }

  toggleSidebar() {
    this.isSidebarExpanded.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  toggleSearchModal() {
    const isCurrentlyOpen = this.isSearchOpen();
    this.isCommandModalOpen.set(false);
    this.isSearchOpen.set(!isCurrentlyOpen);
  }

  openSearch() {
    this.closeMobileMenu();
    this.isCommandModalOpen.set(false);
    this.isSearchOpen.set(true);
  }

  closeSearch() {
    this.isSearchOpen.set(false);
  }

  toggleCommandModal() {
    const isCurrentlyOpen = this.isCommandModalOpen();
    this.isSearchOpen.set(false);
    this.isCommandModalOpen.set(!isCurrentlyOpen);
  }

  openCommandModal() {
    this.closeMobileMenu();
    this.isSearchOpen.set(false);
    this.isCommandModalOpen.set(true);
  }

  closeCommandModal() {
    this.isCommandModalOpen.set(false);
  }
}