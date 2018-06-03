import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ConcreteSlabAnnotatorImageModule } from './image/image.module';
import { ConcreteSlabAnnotatorAnnotationModule } from './annotation/annotation.module';
import { ConcreteSlabAnnotatorRectangleModule } from './rectangle/rectangle.module';
/* jhipster-needle-add-entity-module-import - JHipster will add entity modules imports here */

@NgModule({
    imports: [
        ConcreteSlabAnnotatorImageModule,
        ConcreteSlabAnnotatorAnnotationModule,
        ConcreteSlabAnnotatorRectangleModule,
        /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
    ],
    declarations: [],
    entryComponents: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ConcreteSlabAnnotatorEntityModule {}
