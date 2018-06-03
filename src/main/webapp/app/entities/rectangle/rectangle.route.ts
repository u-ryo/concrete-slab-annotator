import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { RectangleComponent } from './rectangle.component';
import { RectangleDetailComponent } from './rectangle-detail.component';
import { RectanglePopupComponent } from './rectangle-dialog.component';
import { RectangleDeletePopupComponent } from './rectangle-delete-dialog.component';

export const rectangleRoute: Routes = [
    {
        path: 'rectangle',
        component: RectangleComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'concreteSlabAnnotatorApp.rectangle.home.title'
        },
        canActivate: [UserRouteAccessService]
    }, {
        path: 'rectangle/:id',
        component: RectangleDetailComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'concreteSlabAnnotatorApp.rectangle.home.title'
        },
        canActivate: [UserRouteAccessService]
    }
];

export const rectanglePopupRoute: Routes = [
    {
        path: 'rectangle-new',
        component: RectanglePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'concreteSlabAnnotatorApp.rectangle.home.title'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'rectangle/:id/edit',
        component: RectanglePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'concreteSlabAnnotatorApp.rectangle.home.title'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    },
    {
        path: 'rectangle/:id/delete',
        component: RectangleDeletePopupComponent,
        data: {
            authorities: ['ROLE_USER'],
            pageTitle: 'concreteSlabAnnotatorApp.rectangle.home.title'
        },
        canActivate: [UserRouteAccessService],
        outlet: 'popup'
    }
];
