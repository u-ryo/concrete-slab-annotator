import { Annotation } from '../entities/annotation/annotation.model';
import { FormGroup } from '@angular/forms';
import { Injectable } from '@angular/core';
import { Rectangle } from '../entities/rectangle/rectangle.model';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class DataService {
    form: FormGroup;
    image: any;
    rectangles: Map<string, Rectangle>;
    annotation: Annotation;
    private commentDataSource = new Subject<string>();
    private redrawDataSource = new Subject<string>();
    public commentData$ = this.commentDataSource.asObservable();
    public redrawData$ = this.redrawDataSource.asObservable();

    constructor() {
        this.rectangles = new Map<string, Rectangle>();
    }

    notifyComment(comment: any) {
        this.commentDataSource.next(comment);
    }

    notifyRedraw() {
        this.redrawDataSource.next();
        // console.log('data.service notifyRedraw():');
    }
}
