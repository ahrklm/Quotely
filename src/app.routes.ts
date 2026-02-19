
import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: 'quotes',
        loadComponent: () => import('./pages/quotes-overview/quotes-overview.component').then(m => m.QuotesOverviewComponent)
    },
    {
        path: 'quote/:id',
        loadComponent: () => import('./pages/quote-detail/quote-detail.component').then(m => m.QuoteDetailComponent)
    },
    {
        path: 'templates',
        loadComponent: () => import('./pages/templates-overview/templates-overview.component').then(m => m.TemplatesOverviewComponent)
    },
    {
        path: 'template/:id',
        loadComponent: () => import('./pages/template-detail/template-detail.component').then(m => m.TemplateDetailComponent)
    },
    {
        path: 'projects',
        loadComponent: () => import('./pages/projects-overview/projects-overview.component').then(m => m.ProjectsOverviewComponent)
    },
    {
        path: 'project/:id',
        loadComponent: () => import('./pages/project-detail/project-detail.component').then(m => m.ProjectDetailComponent)
    },
    {
        path: 'domains',
        loadComponent: () => import('./pages/domains-overview/domains-overview.component').then(m => m.DomainsOverviewComponent)
    },
    {
        path: 'domain/:id',
        loadComponent: () => import('./pages/domain-detail/domain-detail.component').then(m => m.DomainDetailComponent)
    },
    {
        path: 'contacts',
        loadComponent: () => import('./pages/contacts-overview/contacts-overview.component').then(m => m.ContactsOverviewComponent)
    },
    {
        path: 'contact/:id',
        loadComponent: () => import('./pages/contact-detail/contact-detail.component').then(m => m.ContactDetailComponent)
    },
    {
        path: 'client/:token',
        loadComponent: () => import('./pages/client-view/client-view.component').then(m => m.ClientViewComponent)
    },
    {
        path: 'export/pdf/:id',
        loadComponent: () => import('./pages/pdf-export/pdf-export.component').then(m => m.PdfExportComponent)
    },
    {
        path: 'docs',
        loadComponent: () => import('./pages/documentation/documentation.component').then(m => m.DocumentationComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];