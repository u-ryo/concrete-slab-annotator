import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ConcreteSlabAnnotatorSharedModule } from '../shared';

import { HOME_ROUTE, HomeComponent } from './';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule, MatInputModule, MatFormFieldModule,
         MatSelectModule, MatSliderModule, MatSlideToggleModule
       } from '@angular/material';
import { WebStorageModule } from 'ngx-store';
import { MouseWheelDirective } from '../shared/mousewheel.directive';

import { ControlPanelComponent } from './control-panel/control-panel.component';
import { ViewPanelComponent } from './view-panel/view-panel.component';

@NgModule({
    imports: [
        ConcreteSlabAnnotatorSharedModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatExpansionModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatSliderModule,
        MatSlideToggleModule,
        WebStorageModule,
        RouterModule.forChild([ HOME_ROUTE ])
    ],
    declarations: [
        HomeComponent,
        ControlPanelComponent,
        ViewPanelComponent,
        MouseWheelDirective
    ],
    entryComponents: [
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ConcreteSlabAnnotatorHomeModule {}
