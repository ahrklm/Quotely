
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, viewChild, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { IconService } from '../../services/icon.service';
import { SearchResult } from '../../models/types';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [],
  templateUrl: './search-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  }
})
export class SearchModalComponent implements OnInit {
  isOpen = input.required<boolean>();
  close = output<void>();

  dataService = inject(DataService);
  iconService = inject(IconService);
  router: Router = inject(Router);

  query = signal('');
  results = signal<SearchResult[]>([]);
  recentSearches = signal<SearchResult[]>([]);
  selectedIndex = signal(0);
  isLoading = signal(false);

  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  flatResults = computed(() => {
    const queryExists = this.query().length > 1;
    const res = queryExists ? this.results() : this.recentSearches();
    return res;
  });

  groupedResults = computed(() => {
    return this.results().reduce((acc, item) => {
      (acc[item.type] = acc[item.type] || []).push(item);
      return acc;
    }, {} as Record<SearchResult['type'], SearchResult[]>);
  });

  resultCategories = computed(() => Object.keys(this.groupedResults()) as SearchResult['type'][]);

  constructor() {
    effect(() => {
        if (this.isOpen() && this.searchInput()) {
            // Use a timeout to ensure the element is focusable after rendering.
            setTimeout(() => this.searchInput()?.nativeElement.focus(), 0);
        }
    });

    effect((onCleanup) => {
      const currentQuery = this.query();
      if (currentQuery.length < 1) {
        this.results.set([]);
        this.selectedIndex.set(0);
        return;
      }

      this.isLoading.set(true);
      const timer = setTimeout(() => {
        const searchResults = this.dataService.performSearch(currentQuery);
        this.results.set(searchResults);
        this.isLoading.set(false);
        this.selectedIndex.set(0);
      }, 250);

      onCleanup(() => clearTimeout(timer));
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.loadRecentSearches();
  }

  onDocumentKeydown(event: KeyboardEvent) {
    if (!this.isOpen()) return;

    const results = this.flatResults();
    if (event.key === 'Escape') {
      this.closeModal();
    } else if (results.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.selectedIndex.update(i => (i + 1) % results.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.selectedIndex.update(i => (i - 1 + results.length) % results.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const selectedItem = results[this.selectedIndex()];
        if (selectedItem) {
          this.selectItemAndNavigate(selectedItem);
        }
      }
    }
  }

  onQueryChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
  }

  selectItemAndNavigate(item: SearchResult): void {
    this.router.navigateByUrl(item.route);
    this.addRecentSearch(item);
    this.closeModal();
  }

  closeModal(): void {
    this.query.set('');
    this.results.set([]);
    this.selectedIndex.set(0);
    this.close.emit();
  }

  private loadRecentSearches(): void {
    try {
      const stored = localStorage.getItem('quotely-recent-searches');
      if (stored) {
        this.recentSearches.set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load recent searches', e);
      this.recentSearches.set([]);
    }
  }

  private addRecentSearch(item: SearchResult): void {
    this.recentSearches.update(recents => {
      const filtered = recents.filter(r => r.route !== item.route);
      const newRecents = [item, ...filtered].slice(0, 4);
      try {
        localStorage.setItem('quotely-recent-searches', JSON.stringify(newRecents));
      } catch (e) {
        console.error('Failed to save recent searches', e);
      }
      return newRecents;
    });
  }
}
