import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ConcreteSlabAnnotatorSharedModule } from '../shared';

import { HOME_ROUTE, CompareDialogComponent, HomeComponent,
         SinceDialogComponent } from './';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule, MatDialogModule, MatExpansionModule,
         MatInputModule, MatFormFieldModule, MatMenuModule, MatNativeDateModule,
         MatProgressSpinnerModule, MatSelectModule, MatSliderModule,
         MatSlideToggleModule } from '@angular/material';
import { WebStorageModule } from 'ngx-store';
import { MouseWheelDirective } from '../shared/mousewheel.directive';

import { ControlPanelComponent, LoadingDialogComponent } from './control-panel/control-panel.component';
import { ViewPanelComponent } from './view-panel/view-panel.component';
import { DatePipe } from '@angular/common';

@NgModule({
    imports: [
        ConcreteSlabAnnotatorSharedModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatExpansionModule,
        MatInputModule,
        MatFormFieldModule,
        MatMenuModule,
        MatNativeDateModule,
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
        LoadingDialogComponent,
        SinceDialogComponent
    ],
    entryComponents: [
        CompareDialogComponent,
        LoadingDialogComponent,
        SinceDialogComponent
    ],
    providers: [
        DatePipe
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class ConcreteSlabAnnotatorHomeModule {}
