import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { AnnotationComponent } from './annotation.component';
import { AnnotationDetailComponent } from './annotation-detail.component';
import { AnnotationPopupComponent } from './annotation-dialog.component';
import { AnnotationDeletePopupComponent } from './annotation-delete-dialog.component';

export const annotationRoute: Routes = [
    {
        path: 'annotation',
        component: AnnotationComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'concreteSlabAnnotatorApp.annotation.home.title'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'annotation/:id',
        component: AnnotationDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'concreteSlabAnnotatorApp.annotation.home.title'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const annotationPopupRoute: Routes = [
    {
        path: 'annotation-new',
        component: AnnotationPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'concreteSlabAnnotatorApp.annotation.home.title'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'annotation/:id/edit',
        component: AnnotationPopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'concreteSlabAnnotatorApp.annotation.home.title'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'annotation/:id/delete',
        component: AnnotationDeletePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'concreteSlabAnnotatorApp.annotation.home.title'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
