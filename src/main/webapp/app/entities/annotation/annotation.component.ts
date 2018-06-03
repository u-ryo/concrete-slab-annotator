import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Annotation } from './annotation.model';
import { AnnotationService } from './annotation.service';
import { Principal } from '../../shared';

@Component({
    selector: 'jhi-annotation',
    templateUrl: './annotation.component.html'
})
export class AnnotationComponent implements OnInit, OnDestroy {
annotations: Annotation[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private annotationService: AnnotationService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    loadAll() {
        this.annotationService.query().subscribe(
            (res: HttpResponse<Annotation[]>) => {
                this.annotations = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInAnnotations();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: Annotation) {
        return item.id;
    }
    registerChangeInAnnotations() {
        this.eventSubscriber = this.eventManager.subscribe('annotationListModification', (response) => this.loadAll());
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
