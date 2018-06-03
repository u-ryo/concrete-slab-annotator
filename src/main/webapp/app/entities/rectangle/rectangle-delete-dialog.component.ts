import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { Rectangle } from './rectangle.model';
import { RectanglePopupService } from './rectangle-popup.service';
import { RectangleService } from './rectangle.service';

@Component({
    selector: 'jhi-rectangle-delete-dialog',
    templateUrl: './rectangle-delete-dialog.component.html'
})
export class RectangleDeleteDialogComponent {

    rectangle: Rectangle;

    constructor(
        private rectangleService: RectangleService,
        public activeModal: NgbActiveModal,
        private eventManager: JhiEventManager
    ) {
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete(id: number) {
        this.rectangleService.delete(id).subscribe((response) => {
            this.eventManager.broadcast({
                name: 'rectangleListModification',
                content: 'Deleted an rectangle'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-rectangle-delete-popup',
    template: ''
})
export class RectangleDeletePopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private rectanglePopupService: RectanglePopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            this.rectanglePopupService
                .open(RectangleDeleteDialogComponent as Component, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
