import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ConcreteSlabAnnotatorSharedModule } from '../../shared';
import {
    RectangleService,
    RectanglePopupService,
    RectangleComponent,
    RectangleDetailComponent,
    RectangleDialogComponent,
    RectanglePopupComponent,
    RectangleDeletePopupComponent,
    RectangleDeleteDialogComponent,
    rectangleRoute,
    rectanglePopupRoute,
} from './';

const ENTITY_STATES = [
    ...rectangleRoute,
    ...rectanglePopupRoute,
];

@NgModule({
    imports: [
        ConcreteSlabAnnotatorSharedModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [
        RectangleComponent,
        RectangleDetailComponent,
        RectangleDialogComponent,
        RectangleDeleteDialogComponent,
        RectanglePopupComponent,
        RectangleDeletePopupComponent,
    ],
    entryComponents: [
        RectangleComponent,
        RectangleDialogComponent,
        RectanglePopupComponent,
        RectangleDeleteDialogComponent,
        RectangleDeletePopupComponent,
    ],
    providers: [
        RectangleService,
        RectanglePopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ConcreteSlabAnnotatorRectangleModule {}
