import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Rectangle } from './rectangle.model';
import { RectangleService } from './rectangle.service';
import { Principal } from '../../shared';

@Component({
    selector: 'jhi-rectangle',
    templateUrl: './rectangle.component.html'
})
export class RectangleComponent implements OnInit, OnDestroy {
rectangles: Rectangle[];
    currentAccount: any;
    eventSubscriber: Subscription;

    constructor(
        private rectangleService: RectangleService,
        private jhiAlertService: JhiAlertService,
        private eventManager: JhiEventManager,
        private principal: Principal
    ) {
    }

    loadAll() {
        this.rectangleService.query().subscribe(
            (res: HttpResponse<Rectangle[]>) => {
                this.rectangles = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }
    ngOnInit() {
        this.loadAll();
        this.principal.identity().then((account) => {
            this.currentAccount = account;
        });
        this.registerChangeInRectangles();
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.eventSubscriber);
    }

    trackId(index: number, item: Rectangle) {
        return item.id;
    }
    registerChangeInRectangles() {
        this.eventSubscriber = this.eventManager.subscribe('rectangleListModification', (response) => this.loadAll());
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
