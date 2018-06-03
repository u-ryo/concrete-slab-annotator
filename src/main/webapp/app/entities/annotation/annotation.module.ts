import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ConcreteSlabAnnotatorSharedModule } from '../../shared';
import {
    AnnotationService,
    AnnotationPopupService,
    AnnotationComponent,
    AnnotationDetailComponent,
    AnnotationDialogComponent,
    AnnotationPopupComponent,
    AnnotationDeletePopupComponent,
    AnnotationDeleteDialogComponent,
    annotationRoute,
    annotationPopupRoute,
} from './';

const ENTITY_STATES = [
    ...annotationRoute,
    ...annotationPopupRoute,
];

@NgModule({
    imports: [
        ConcreteSlabAnnotatorSharedModule,
        RouterModule.forChild(ENTITY_STATES)
    ],
    declarations: [
        AnnotationComponent,
        AnnotationDetailComponent,
        AnnotationDialogComponent,
        AnnotationDeleteDialogComponent,
        AnnotationPopupComponent,
        AnnotationDeletePopupComponent,
    ],
    entryComponents: [
        AnnotationComponent,
        AnnotationDialogComponent,
        AnnotationPopupComponent,
        AnnotationDeleteDialogComponent,
        AnnotationDeletePopupComponent,
    ],
    providers: [
        AnnotationService,
        AnnotationPopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ConcreteSlabAnnotatorAnnotationModule {}
