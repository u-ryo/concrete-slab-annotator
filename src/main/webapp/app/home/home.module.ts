import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ConcreteSlabAnnotatorSharedModule } from '../shared';

import { HOME_ROUTE, CompareDialogComponent, HomeComponent } from './';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatExpansionModule, MatInputModule,
         MatFormFieldModule, MatMenuModule, MatProgressSpinnerModule,
         MatSelectModule, MatSliderModule, MatSlideToggleModule } from '@angular/material';
import { WebStorageModule } from 'ngx-store';
import { MouseWheelDirective } from '../shared/mousewheel.directive';

import { ControlPanelComponent, LoadingDialogComponent } from './control-panel/control-panel.component';
import { ViewPanelComponent } from './view-panel/view-panel.component';

@NgModule({
    imports: [
        ConcreteSlabAnnotatorSharedModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatExpansionModule,
        MatInputModule,
        MatFormFieldModule,
        MatMenuModule,
        MatProgressSpinnerModule,
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
        MouseWheelDirective,
        CompareDialogComponent,
        LoadingDialogComponent
    ],
    entryComponents: [
        CompareDialogComponent,
        LoadingDialogComponent
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ConcreteSlabAnnotatorHomeModule {}
