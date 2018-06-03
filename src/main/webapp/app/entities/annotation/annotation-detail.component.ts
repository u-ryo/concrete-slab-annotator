import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { Annotation } from './annotation.model';
import { AnnotationService } from './annotation.service';

@Component({
    selector: 'jhi-annotation-detail',
    templateUrl: './annotation-detail.component.html'
})
export class AnnotationDetailComponent implements OnInit, OnDestroy {

    annotation: Annotation;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: JhiEventManager,
        private annotationService: AnnotationService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInAnnotations();
    }

    load(id) {
        this.annotationService.find(id)
            .subscribe((annotationResponse: HttpResponse<Annotation>) => {
                this.annotation = annotationResponse.body;
            });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInAnnotations() {
        this.eventSubscriber = this.eventManager.subscribe(
            'annotationListModification',
            (response) => this.load(this.annotation.id)
        );
    }
}
