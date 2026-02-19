
import { ChangeDetectionStrategy, Component, output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { IconService } from '../../services/icon.service';
import { AFKL_LOGO_URL } from '../../assets/assets';

@Component({
  selector: 'app-header',
  template: `
    <header class="afkl-gradient text-white h-[61px] flex items-center justify-between px-6 shrink-0 sticky top-0 z-[60] no-print">
      <div class="flex items-center gap-4">
        <button
          (click)="mobileMenuToggle.emit()"
          class="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
          aria-label="Toggle navigation"
        >
          <div [innerHTML]="iconService.getIcon('Hamburger')"></div>
        </button>
        <a routerLink="/" class="flex items-center gap-2">
          <img
            [ngSrc]="AFKL_LOGO_URL"
            alt="Air France-KLM Group"
            class="h-[24px] brightness-0 invert"
            width="123"
            height="24"
          />
          <span class="text-xl font-bold border-l border-white/30 pl-3 ml-1 tracking-tight">Quotely</span>
        </a>
      </div>
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium">Jon Snow</span>
          <div class="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xs font-bold hover:bg-white/30 transition-all cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor"><path d="M16 4a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zM26 30H6a2 2 0 0 1-2-2v-3a7 7 0 0 1 7-7h10a7 7 0 0 1 7 7v3a2 2 0 0 1-2 2z"/></svg>
          </div>
          <svg width="12" height="12" viewBox="0 0 32 32" fill="currentColor" class="opacity-60"><path d="M16 22L6 12l1.4-1.4 8.6 8.6 8.6-8.6L26 12z"/></svg>
        </div>
        <button class="p-2 hover:bg-white/10 rounded-lg transition-colors border-l border-white/20 pl-4 ml-2">
          <div [innerHTML]="iconService.getIcon('Logout')"></div>
        </button>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgOptimizedImage],
  standalone: true,
})
export class HeaderComponent {
  iconService = inject(IconService);
  mobileMenuToggle = output<void>();
  AFKL_LOGO_URL = AFKL_LOGO_URL;
}
