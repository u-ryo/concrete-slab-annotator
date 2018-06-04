import './vendor.ts';

import { NgModule, Injector } from '@angular/core';
import { BrowserModule, HammerGestureConfig,
         HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Ng2Webstorage, LocalStorageService, SessionStorageService  } from 'ngx-webstorage';
import { JhiEventManager } from 'ng-jhipster';

import { AuthInterceptor } from './blocks/interceptor/auth.interceptor';
import { AuthExpiredInterceptor } from './blocks/interceptor/auth-expired.interceptor';
import { ErrorHandlerInterceptor } from './blocks/interceptor/errorhandler.interceptor';
import { NotificationInterceptor } from './blocks/interceptor/notification.interceptor';
import { ConcreteSlabAnnotatorSharedModule, UserRouteAccessService } from './shared';
import { ConcreteSlabAnnotatorAppRoutingModule} from './app-routing.module';
import { ConcreteSlabAnnotatorHomeModule } from './home/home.module';
import { ConcreteSlabAnnotatorAdminModule } from './admin/admin.module';
import { ConcreteSlabAnnotatorAccountModule } from './account/account.module';
import { ConcreteSlabAnnotatorEntityModule } from './entities/entity.module';
import { DataService } from './shared/data.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginationConfig } from './blocks/config/uib-pagination.config';
import * as Hammer from 'hammerjs';
// jhipster-needle-angular-add-module-import JHipster will add new module here
import {
    JhiMainComponent,
    NavbarComponent,
    FooterComponent,
    ProfileService,
    PageRibbonComponent,
    ActiveMenuDirective,
    ErrorComponent
} from './layouts';

export class MyHammerConfig extends HammerGestureConfig  {
    overrides = <any>{
        // override hammerjs default configuration
        'swipe': { direction: Hammer.DIRECTION_ALL },
        'pan': { direction: Hammer.DIRECTION_ALL },
        'pinch': { direction: Hammer.DIRECTION_ALL }
    };
}

@NgModule({
    imports: [
        BrowserModule,
        ConcreteSlabAnnotatorAppRoutingModule,
        Ng2Webstorage.forRoot({ prefix: 'jhi', separator: '-'}),
        ConcreteSlabAnnotatorSharedModule,
        ConcreteSlabAnnotatorHomeModule,
        ConcreteSlabAnnotatorAdminModule,
        ConcreteSlabAnnotatorAccountModule,
        ConcreteSlabAnnotatorEntityModule,
        // jhipster-needle-angular-add-module JHipster will add new module here
        NgbModule.forRoot()
    ],
    declarations: [
        JhiMainComponent,
        NavbarComponent,
        ErrorComponent,
        PageRibbonComponent,
        ActiveMenuDirective,
        FooterComponent
    ],
    providers: [
        ProfileService,
        PaginationConfig,
        UserRouteAccessService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
            deps: [
                LocalStorageService,
                SessionStorageService
            ]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthExpiredInterceptor,
            multi: true,
            deps: [
                Injector
            ]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorHandlerInterceptor,
            multi: true,
            deps: [
                JhiEventManager
            ]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: NotificationInterceptor,
            multi: true,
            deps: [
                Injector
            ]
        },
        DataService,
        { provide: HAMMER_GESTURE_CONFIG,  useClass: MyHammerConfig }
    ],
    bootstrap: [ JhiMainComponent ]
})
export class ConcreteSlabAnnotatorAppModule {}
