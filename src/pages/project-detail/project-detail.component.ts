
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DataService } from '../../services/data.service';
import { IconService } from '../../services/icon.service';
import { ToastService } from '../../services/toast.service';
import { Project } from '../../models/types';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
@if (project(); as p) {
  <div class="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
    <!-- Header -->
    <div>
      <a routerLink="/projects" class="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 mb-2">
        <div [innerHTML]="iconService.getIcon('ChevronLeft')"></div>
        back
      </a>
      <h1 class="text-3xl font-bold text-[#0800B9]">
        @if (isNewProject()) {
          Create New Project
        } @else {
          Project: {{ p.name }}
        }
      </h1>
    </div>

    <!-- Form -->
    <div class="bg-white p-8 rounded-lg border border-slate-200/80 shadow-sm space-y-6">
      <h3 class="text-xl font-bold text-slate-800">Project info</h3>
      
      <label class="block">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Project Name</span>
        <input 
          type="text" 
          [(ngModel)]="p.name"
          class="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
      </label>

      <label class="block">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</span>
        <textarea 
          [(ngModel)]="p.description" 
          rows="4" 
          class="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </label>

      <div class="flex items-center justify-end gap-4 pt-4 border-t border-slate-200/80">
        @if (!isNewProject()) {
          <button (click)="deleteProject()" class="text-sm font-bold text-red-600 hover:text-red-800 transition-colors">
            Delete Project
          </button>
        }
        <button (click)="saveProject()" class="bg-[#0800B9] text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-lg">
          Save Project
        </button>
      </div>
    </div>
  </div>
} @else {
  <div class="p-10 text-center">
    <p class="text-slate-500">Loading project...</p>
  </div>
}
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  dataService = inject(DataService);
  iconService = inject(IconService);
  toastService = inject(ToastService);

  project = signal<Project | null>(null);
  isNewProject = signal(false);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const projectId = params.get('id');
      if (projectId) {
        if (projectId === 'new') {
          this.isNewProject.set(true);
          this.project.set(this.dataService.createBlankProject());
        } else {
          this.isNewProject.set(false);
          const existingProject = this.dataService.getProjectById(projectId);
          if (existingProject) {
            this.project.set({ ...existingProject });
          } else {
            this.toastService.showToast('Project not found.', 'danger');
            this.router.navigate(['/projects']);
          }
        }
      }
    });
  }

  saveProject(): void {
    const currentProject = this.project();
    if (currentProject && currentProject.name) {
      this.dataService.saveProject(currentProject);
      this.toastService.showToast('Project saved successfully!', 'success');
      this.router.navigate(['/projects']);
    } else {
      this.toastService.showToast('Project name is required.', 'danger');
    }
  }

  deleteProject(): void {
    const currentProject = this.project();
    if (currentProject && !this.isNewProject()) {
      // Using window.confirm for simplicity as it's an internal tool.
      if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
        const wasDeleted = this.dataService.deleteProject(currentProject.id);
        if (wasDeleted) {
          this.toastService.showToast('Project deleted successfully!', 'success');
          this.router.navigate(['/projects']);
        } else {
          this.toastService.showToast('Could not delete project. It is linked to one or more quotes.', 'danger');
        }
      }
    }
  }
}
