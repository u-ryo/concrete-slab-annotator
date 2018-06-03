import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Annotation } from './annotation.model';
import { AnnotationPopupService } from './annotation-popup.service';
import { AnnotationService } from './annotation.service';
import { Image, ImageService } from '../image';

@Component({
    selector: 'jhi-annotation-dialog',
    templateUrl: './annotation-dialog.component.html'
})
export class AnnotationDialogComponent implements OnInit {

    annotation: Annotation;
    isSaving: boolean;

    images: Image[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private annotationService: AnnotationService,
        private imageService: ImageService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.imageService.query()
            .subscribe((res: HttpResponse<Image[]>) => { this.images = res.body; }, (res: HttpErrorResponse) => this.onError(res.message));
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.annotation.id !== undefined) {
            this.subscribeToSaveResponse(
                this.annotationService.update(this.annotation));
        } else {
            this.subscribeToSaveResponse(
                this.annotationService.create(this.annotation));
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<Annotation>>) {
        result.subscribe((res: HttpResponse<Annotation>) =>
            this.onSaveSuccess(res.body), (res: HttpErrorResponse) => this.onSaveError());
    }

    private onSaveSuccess(result: Annotation) {
        this.eventManager.broadcast({ name: 'annotationListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    trackImageById(index: number, item: Image) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-annotation-popup',
    template: ''
})
export class AnnotationPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private annotationPopupService: AnnotationPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.annotationPopupService
                    .open(AnnotationDialogComponent as Component, params['id']);
            } else {
                this.annotationPopupService
                    .open(AnnotationDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
