
import { Injectable, signal } from '@angular/core';
import { Toast } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  showToast(message: string, type: Toast['type'] = 'info', duration = 5000) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type };

    this.toasts.update(currentToasts => [...currentToasts, newToast]);

    setTimeout(() => this.removeToast(id), duration);
  }

  removeToast(id: string) {
    this.toasts.update(currentToasts => currentToasts.filter(t => t.id !== id));
  }
}
