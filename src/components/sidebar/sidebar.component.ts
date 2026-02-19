import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconService } from '../../services/icon.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col h-full bg-[#FAFAFA] border-r border-slate-200 shadow-sm transition-all duration-300">
      <div class="flex-1 pt-4 pb-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        @for (item of NAV_ITEMS; track item.id) {
          @if (item.type === 'divider') {
            <div class="h-[1px] bg-slate-200 my-4 mx-2"></div>
          } @else {
            @let isActive = router.url === item.route && !item.isAction;
            <button
              (click)="handleNav(item)"
              [class]="'w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all group relative ' + (isActive ? 'bg-[#ECECFF] text-[#0800B9]' : 'text-[#636770] hover:bg-slate-100 hover:text-slate-800')"
              [title]="!isExpanded() ? item.label : ''"
              [attr.aria-current]="isActive ? 'page' : null"
            >
              <div [class]="'shrink-0 transition-all duration-300 ' + (isActive ? 'text-[#0800B9]' : 'text-[#636770] group-hover:text-slate-800')" [innerHTML]="iconService.getIcon(item.iconName)">
              </div>
              <span [class]="'transition-all duration-300 text-sm font-medium whitespace-nowrap overflow-hidden ' + (isExpanded() ? 'w-auto opacity-100 ml-0' : 'w-0 opacity-0 -ml-8')">
                {{ item.label }}
              </span>
              @if (!isExpanded()) {
                 <div class="absolute left-14 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                    {{ item.label }}
                 </div>
              }
            </button>
          }
        }
      </div>

      <div class="p-2 border-t border-slate-100 no-print lg:block hidden">
        <button
          (click)="toggleExpanded.emit()"
          class="w-full flex items-center justify-center p-2 rounded hover:bg-slate-200 transition-all text-[#636770]"
          [attr.aria-label]="isExpanded() ? 'Collapse menu' : 'Expand menu'"
          [attr.aria-expanded]="isExpanded()"
        >
          <div [innerHTML]="isExpanded() ? iconService.getIcon('ChevronLeft') : iconService.getIcon('ChevronRight')"></div>
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-full',
  },
})
export class SidebarComponent {
  isExpanded = input.required<boolean>();
  toggleExpanded = output();
  searchOpen = output();
  commandModalOpen = output();
  navigated = output();

  iconService = inject(IconService);
  // FIX: Explicitly type Router to resolve type inference issue.
  router: Router = inject(Router);

  NAV_ITEMS = [
    { id: 'search', label: 'Search', iconName: 'Search', isAction: true, route: null },
    { id: 'dashboard', label: 'Dashboard', route: '/', iconName: 'Dashboard', isAction: false },
    { id: 'quotes', label: 'Quotes', route: '/quotes', iconName: 'Quotes', isAction: false },
    { id: 'templates', label: 'Templates', route: '/templates', iconName: 'Template', isAction: false },
    { id: 'projects', label: 'Projects', route: '/projects', iconName: 'Projects', isAction: false },
    { id: 'domains', label: 'Domains', route: '/domains', iconName: 'Domains', isAction: false },
    { id: 'contacts', label: 'Contacts', route: '/contacts', iconName: 'Contacts', isAction: false },
    { type: 'divider', id: 'div1', label: '', iconName: '', isAction: false, route: null },
    { id: 'docs', label: 'Docs', route: '/docs', iconName: 'Docs', isAction: false },
    { id: 'hotkeys', label: 'Hotkeys', route: null, iconName: 'Help', isAction: true },
  ];

  handleNav(item: (typeof this.NAV_ITEMS)[number]): void {
    if (item.id === 'search') {
      this.searchOpen.emit();
      return;
    }
    if (item.id === 'hotkeys') {
        this.commandModalOpen.emit();
        return;
    }
    if (item.route) {
      this.router.navigate([item.route]);
      this.navigated.emit();
    }
  }
}