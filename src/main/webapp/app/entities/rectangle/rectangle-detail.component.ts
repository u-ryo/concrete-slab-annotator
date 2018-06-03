import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs/Subscription';
import { JhiEventManager } from 'ng-jhipster';

import { Rectangle } from './rectangle.model';
import { RectangleService } from './rectangle.service';

@Component({
    selector: 'jhi-rectangle-detail',
    templateUrl: './rectangle-detail.component.html'
})
export class RectangleDetailComponent implements OnInit, OnDestroy {

    rectangle: Rectangle;
    private subscription: Subscription;
    private eventSubscriber: Subscription;

    constructor(
        private eventManager: JhiEventManager,
        private rectangleService: RectangleService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe((params) => {
            this.load(params['id']);
        });
        this.registerChangeInRectangles();
    }

    load(id) {
        this.rectangleService.find(id)
            .subscribe((rectangleResponse: HttpResponse<Rectangle>) => {
                this.rectangle = rectangleResponse.body;
            });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.eventManager.destroy(this.eventSubscriber);
    }

    registerChangeInRectangles() {
        this.eventSubscriber = this.eventManager.subscribe(
            'rectangleListModification',
            (response) => this.load(this.rectangle.id)
        );
    }
}
