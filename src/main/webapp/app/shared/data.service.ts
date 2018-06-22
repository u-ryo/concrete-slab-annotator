import { Annotation } from '../entities/annotation/annotation.model';
import { FormGroup } from '@angular/forms';
import { Injectable } from '@angular/core';
import { Rectangle } from '../entities/rectangle/rectangle.model';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class DataService {
    form: FormGroup;
    annotation: Annotation;
    private commentDataSource = new Subject<string>();
    private redrawDataSource = new Subject<Map<string, Rectangle>>();
    public commentData$ = this.commentDataSource.asObservable();
    public redrawData$ = this.redrawDataSource.asObservable();

    constructor() {}

    notifyComment(comment: any) {
        this.commentDataSource.next(comment);
    }

    notifyRedraw(r: Map<string, Rectangle>) {
        this.redrawDataSource.next(r);
    }
}
