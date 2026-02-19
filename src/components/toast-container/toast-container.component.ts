
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [class]="'text-white px-6 py-4 rounded-xl shadow-xl flex items-center justify-between min-w-[320px] max-w-[450px] animate-slide-in pointer-events-auto transition-all duration-300 hover:scale-[1.02] border border-white/10 ' + getBgColor(toast.type)"
        >
          <span class="font-bold text-sm tracking-tight">{{ toast.message }}</span>
          <button
            (click)="toastService.removeToast(toast.id)"
            class="ml-4 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            <span class="text-xl leading-none">✕</span>
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  getBgColor(type: string): string {
    switch (type) {
      case 'success': return 'bg-[#21b366]';
      case 'danger': return 'bg-[#c80000]';
      case 'info': return 'bg-[#1a1f2e]';
      case 'primary': return 'bg-[#0000cd]';
      case 'secondary': return 'bg-[#5e6673]';
      default: return 'bg-[#1a1f2e]';
    }
  }
}
