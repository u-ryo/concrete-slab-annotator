import { Annotation } from '../entities/annotation/annotation.model';
import { FormGroup } from '@angular/forms';
import { Injectable } from '@angular/core';
import { Rectangle } from '../entities/rectangle/rectangle.model';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class DataService {
    form: FormGroup;
    image: any;
    annotation: Annotation;
    private commentDataSource = new Subject<string>();
    private redrawDataSource = new Subject<Map<string, Rectangle>>();
    private imageLoadedDataSource = new Subject<void>();
    public commentData$ = this.commentDataSource.asObservable();
    public redrawData$ = this.redrawDataSource.asObservable();
    public imageLoadedData$ = this.imageLoadedDataSource.asObservable();

    constructor() {}

    notifyComment(comment: any) {
        this.commentDataSource.next(comment);
    }

    notifyRedraw(r: Map<string, Rectangle>) {
        this.redrawDataSource.next(r);
    }

    notifyImageLoaded() {
        this.imageLoadedDataSource.next();
    }
}
