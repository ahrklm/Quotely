
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { DataService } from '../../services/data.service';
import { IconService } from '../../services/icon.service';
import { Quote } from '../../models/types';

@Component({
  selector: 'app-templates-overview',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './templates-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplatesOverviewComponent {
  dataService = inject(DataService);
  iconService = inject(IconService);
  router = inject(Router);

  searchTerm = signal('');

  allTemplates = computed(() => {
    return this.dataService.templates()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  });

  filteredTemplates = computed(() => {
    const lowerCaseSearch = this.searchTerm().toLowerCase();
    if (!lowerCaseSearch) {
      return this.allTemplates();
    }
    return this.allTemplates().filter(template =>
      template.title.toLowerCase().includes(lowerCaseSearch) ||
      template.description.toLowerCase().includes(lowerCaseSearch)
    );
  });
  
  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  createNewTemplate(): void {
    this.router.navigate(['/template', 'new']);
  }
}
