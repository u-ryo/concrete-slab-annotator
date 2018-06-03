import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { Annotation } from './annotation.model';
import { AnnotationPopupService } from './annotation-popup.service';
import { AnnotationService } from './annotation.service';

@Component({
    selector: 'jhi-annotation-delete-dialog',
    templateUrl: './annotation-delete-dialog.component.html'
})
export class AnnotationDeleteDialogComponent {

    annotation: Annotation;

    constructor(
        private annotationService: AnnotationService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.annotationService.delete(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'annotationListModification',
                content: 'Deleted an annotation'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-annotation-delete-popup',
    template: ''
})
export class AnnotationDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private annotationPopupService: AnnotationPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.annotationPopupService
                .open(AnnotationDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
