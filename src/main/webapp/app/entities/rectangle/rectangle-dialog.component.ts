import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Rectangle } from './rectangle.model';
import { RectanglePopupService } from './rectangle-popup.service';
import { RectangleService } from './rectangle.service';
import { Annotation, AnnotationService } from '../annotation';

@Component({
    selector: 'jhi-rectangle-dialog',
    templateUrl: './rectangle-dialog.component.html'
})
export class RectangleDialogComponent implements OnInit {

    rectangle: Rectangle;
    isSaving: boolean;

    annotations: Annotation[];

    constructor(
        public activeModal: NgbActiveModal,
        private jhiAlertService: JhiAlertService,
        private rectangleService: RectangleService,
        private annotationService: AnnotationService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.annotationService.query()
            .subscribe((res: HttpResponse<Annotation[]>) => { this.annotations = res.body; }, (res: HttpErrorResponse) => this.onError(res.message));
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.rectangle.id !== undefined) {
            this.subscribeToSaveResponse(
                this.rectangleService.update(this.rectangle));
        } else {
            this.subscribeToSaveResponse(
                this.rectangleService.create(this.rectangle));
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<Rectangle>>) {
        result.subscribe((res: HttpResponse<Rectangle>) =>
            this.onSaveSuccess(res.body), (res: HttpErrorResponse) => this.onSaveError());
    }

    private onSaveSuccess(result: Rectangle) {
        this.eventManager.broadcast({ name: 'rectangleListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }

    trackAnnotationById(index: number, item: Annotation) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-rectangle-popup',
    template: ''
})
export class RectanglePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private rectanglePopupService: RectanglePopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.rectanglePopupService
                    .open(RectangleDialogComponent as Component, params['id']);
            } else {
                this.rectanglePopupService
                    .open(RectangleDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
