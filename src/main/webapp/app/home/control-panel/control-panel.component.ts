import { ActivatedRoute, Router } from '@angular/router';
import { Annotation, DefectName } from '../../entities/annotation/annotation.model';
import { AnnotationService } from '../../entities/annotation/annotation.service';
import { Camera, Image } from '../../entities/image/image.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../../shared/data.service';
import { DEBUG_INFO_ENABLED } from '../../app.constants';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { ImageService } from '../../entities/image/image.service';
import { JhiAlertService } from 'ng-jhipster';
import { Level, Log } from 'ng2-logger/client';
import { LocalStorage, SharedStorage } from 'ngx-store';
import { MatDialog } from '@angular/material';
import { Principal } from '../../shared';
import { Rectangle } from '../../entities/rectangle/rectangle.model';
import { RectangleService } from '../../entities/rectangle/rectangle.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'jhi-control-panel',
    templateUrl: './control-panel.component.html',
    styles: []
})
export class ControlPanelComponent implements OnDestroy, OnInit {
    inputForm: FormGroup;
    private subscriptions: Subscription[] = [];
    cameras = Object.keys(Camera);
    defects = Object.keys(DefectName);
    @SharedStorage() images: Image[];
    @LocalStorage() image: Image;
    @SharedStorage() filename: string;
    coordinate = { coordinate: 'this image' };
    private focalLength = 0;
    private distance = 0;
    private squareSize = 2;
    @LocalStorage() annotation: Annotation;
    @LocalStorage() brightness: number;
    auto;
    comment;
    private log =
        Log.create('control-panel', Level.WARN, Level.INFO, Level.ERROR);
    private rate = 0.46;
    @SharedStorage() rectangles2 = null;
    private dialogRef;

    constructor(private activatedRoute: ActivatedRoute,
                private annotationService: AnnotationService,
                private dataService: DataService,
                public dialog: MatDialog,
                private formBuilder: FormBuilder,
                private imageService: ImageService,
                private jhiAlertService: JhiAlertService,
                private principal: Principal,
                private rectangleService: RectangleService,
                private router: Router) {
        if (!DEBUG_INFO_ENABLED) {
            Log.setProductionMode();
        }
        this.log.d('constructor called.');
    }

    loadAll() {
        this.subscriptions.push(
            this.imageService.query().subscribe(
                (res: HttpResponse<Image[]>) => {
                    this.images = res.body;
                    this.log.d(`filename:${this.filename}, images:`, this.images,
                               'image:', this.image, 'annotation:', this.annotation);
                    if (this.filename) {
                        const imgs = this.images.filter(
                            (i) => i.filename === this.filename);
                        this.log.d('imgs:', imgs, `imgs.length:${imgs.length}`);
                        if (imgs.length > 0) {
                            this.image = imgs[0];
                            this.image = imgs[0];
                            this.log.d('this.image:', this.image,
                                       'imgs[0]:', imgs[0],
                                       `this.filename:${this.filename}`);
                        } else {
                            this.image = null;
                            this.image = null;
                        }
                    }
                    this.log.d('image0:', this.image);
                    if (!this.image) {
                        this.image = this.images[0];
                    }
                    this.log.d('image1:', this.image,
                               'image.filename:', this.image.filename);
                    this.distance = this.image.distance;
                    this.focalLength = this.image.focalLength;
                    this.filename = this.image.filename;
                    this.rebuildForm();
                    this.log.d('image:', this.image,
                               'image.filename:', this.image.filename);
                    this.inputForm.controls['fileUrlField'].setValue(
                        this.image.filename);
                },
                (res: HttpErrorResponse) => {
                    this.log.er(res.message);
                    this.onError(res.message);
                }
            ));
    }

    ngOnInit() {
        const filenameParam = this.activatedRoute.snapshot.queryParams.filename;
        this.log.d(`filename param:`, filenameParam);
        if (filenameParam) {
            this.filename = filenameParam;
        }
        this.loadAll();
        this.subscriptions.push(
            this.dataService.commentData$
                .subscribe((comment) => this.setComment(comment)));
        this.subscriptions.push(this.dataService.imageLoadedData$
                                .subscribe(() => this.changeSize()));
        this.createForm();
        this.log.d('defects:', this.defects);
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    createForm() {
        this.inputForm = this.formBuilder.group({
            fileUrlField: '',
            columns: [153, Validators.required],
            rows: [115, Validators.required],
            distance: [this.distance, Validators.required],
            focalLength: [this.focalLength, Validators.required],
            squareSize: [this.squareSize, Validators.required],
            camera: this.cameras[0],
            defect: this.defects[0],
            pending: false,
            lock: true,
            brightnessLevel: this.brightness,
            comment: { value: '', disabled: true },
            coordinateXField: 0,
            coordinateYField: 0
        });
        // this.inputForm.get('squareSize').valueChanges
        //     .debounceTime(500)
        //     .subscribe((squareSize) => {
        //         this.squareSize = squareSize;
        //         this.changeSize();
        //     });
        // this.inputForm.get('distance').valueChanges
        //     .debounceTime(500)
        //     .subscribe((distance) => {
        //         this.distance = distance;
        //         this.changeSize();
        //     });
        // this.inputForm.get('focalLength').valueChanges
        //     .debounceTime(500)
        //     .subscribe((focalLength) => {
        //         this.focalLength = focalLength;
        //         this.changeSize();
        //     });
        this.subscriptions.push(
            this.inputForm.get('defect').valueChanges
                .debounceTime(500)
                .subscribe((defect) => this.loadAnnotation(defect)));
        this.subscriptions.push(
            this.inputForm.get('fileUrlField').valueChanges
                .debounceTime(1000)
                .subscribe((fileUrl) => this.setImage(fileUrl)));
        this.inputForm.get('brightnessLevel').valueChanges
            .debounceTime(500)
            .forEach((brightness) => this.brightness = brightness);
        this.dataService.form = this.inputForm;
    }

    rebuildForm() {
        this.log.d('dataService.image:', this.dataService.image);
        this.inputForm.reset({
            fileUrlField: this.image
                ? this.image.filename : this.images[0].filename,
            distance: this.distance,
            focalLength: this.focalLength,
            squareSize: (this.annotation && this.annotation.squareSize)
                ? this.annotation.squareSize : this.squareSize,
            camera: this.image ? this.image.camera : this.images[0].camera,
            columns: this.dataService.image ? Math.round(
                this.distance * this.rate / this.focalLength / this.squareSize
                    * this.dataService.image.naturalWidth) : 153,
            rows: this.dataService.image ? Math.round(
                this.distance * this.rate / this.focalLength / this.squareSize
                    * this.dataService.image.naturalHeight) : 115,
            // columns: 153,
            // rows: 115,
            defect: (this.annotation && this.annotation.defect)
                ? this.annotation.defect : this.defects[0],
            pending: false,
            lock: true,
            brightnessLevel: this.brightness,
            comment: { value: '', disabled: true },
            coordinateXField: 0,
            coordinateYField: 0
        },
                             {
            emitEvent: false,
            onlySelf: true
        });
    }

    changeSize() {
        if (this.inputForm.value.focalLength === 0
            || this.inputForm.value.squareSize === 0
            || !this.dataService.image
            || this.dataService.image.naturalWidth === 0) {
            return;
        }
        this.log.d('squareSize:', this.squareSize,
                   'annotation:', this.annotation);
        if (this.squareSize !== this.annotation.squareSize) {
            this.loadAnnotation(this.inputForm.value.defect);
        }
        const baseValue = this.distance * this.rate / this.focalLength
            / this.squareSize;
        this.log.d('squareSize:', this.inputForm.value.squareSize,
                   'image.naturalWidth:', this.dataService.image.naturalWidth,
                   'columns:', Math.round(
                       baseValue * this.dataService.image.naturalWidth));
        this.inputForm.controls['columns'].setValue(
            Math.round(baseValue * this.dataService.image.naturalWidth),
            // 153,
            { emitEvent: false });
        this.inputForm.controls['rows'].setValue(
            Math.round(baseValue * this.dataService.image.naturalHeight),
            // 115,
            { emitEvent: false });
        this.log.d('focalLength:', this.focalLength,
                   'distance:', this.distance,
                   'squareSize:', this.squareSize,
                   'rows:', this.inputForm.value.rows);
        this.dataService.form = this.inputForm;
    }

    setComment(comment) {
        this.inputForm.controls['comment'].setValue(comment.comment,
                                                    { emitEvent: false });
        this.coordinate = { coordinate: comment.coordinate };
        const coordinates = this.coordinate.coordinate.split(',');
        this.inputForm.controls['coordinateXField'].setValue(
            coordinates[0], { emitEvent: false });
        this.inputForm.controls['coordinateYField'].setValue(
            coordinates[1], { emitEvent: false });
        if (comment.showOnly) {
            this.inputForm.controls['comment'].disable({ emitEvent: false });
        } else {
            this.inputForm.controls['comment'].enable({ emitEvent: false });
        }
        this.log.d('comment from view:', comment);
    }

    setImage(fileUrl) {
        this.log.d(`fileUrl:${fileUrl}`);
        const index = (fileUrl ? fileUrl.length : 0) - 4;
        this.log.d(`fileUrl.indexOf(jpg):${fileUrl.indexOf('.jpg', index)}`);
        if (index < 0 || (fileUrl.indexOf('.jpg', index) < 0
                          && fileUrl.indexOf('.png', index) < 0
                          && fileUrl.indexOf('.tif', index) < 0
                          && fileUrl.indexOf('.gif', index) < 0)) {
            return;
        }
        const imgs = this.images.filter((i) => i.filename === fileUrl);
        this.log.d('imgs:', imgs, 'images:', this.images);
        if (imgs.length === 0) {
            this.inputForm.controls['lock'].setValue(true);
            this.inputForm.controls['lock'].disable();
            return;
        } else {
            this.inputForm.controls['lock'].enable();
        }
        this.image = imgs[0];
        this.focalLength = this.image.focalLength;
        this.distance = this.image.distance;
        this.inputForm.controls['focalLength'].setValue(this.image.focalLength,
                                                        { emitEvent: false });
        this.inputForm.controls['distance'].setValue(this.image.distance,
                                                     { emitEvent: false });
        this.inputForm.controls['camera'].setValue(this.image.camera,
                                                   { emitEvent: false });
        this.inputForm.controls['columns'].setValue(
            Math.round(this.distance * this.rate / this.focalLength
                       / this.squareSize * this.image.width),
            { emitEvent: false });
        this.inputForm.controls['rows'].setValue(
            Math.round(this.distance * this.rate / this.focalLength
                       / this.squareSize * this.image.height),
            { emitEvent: false });
        this.inputForm.controls['defect'].setValue(
            this.annotation ? this.annotation.defect : this.defects[0],
            { emitEvent: false });
        this.brightness = 100;
        this.inputForm.controls['brightnessLevel'].setValue(this.brightness);
        this.log.d(`brightness:${this.brightness},`
                   + `brightnessLevel:${this.inputForm.value.brightnessLevel}`);
        this.squareSize = this.annotation ? this.annotation.squareSize : 2;
        this.loadAnnotation(this.inputForm.value.defect);
        this.filename = this.image.filename;
    }

    loadAnnotation(defect) {
        this.rectangles2 = null;
        this.openLoadingDialog();
        if (defect === DefectName.POPOUT || defect === DefectName.SCALING) {
            this.loadScaleOrPopout(defect === DefectName.POPOUT
                                   ? DefectName.SCALING : DefectName.POPOUT);
        }

        this.subscriptions.push(
            this.annotationService.queryWithImageIdDefectAndSquareSize(
                this.image.id, this.squareSize, defect).subscribe(
                    (res: HttpResponse<Annotation>) => {
                        this.annotation = res.body;
                        this.annotation = res.body;
                        this.log.d('annotation:', this.annotation);
                        this.changeAnnotation();
                    },
                    (res: HttpErrorResponse) => {
                        this.log.er(res.message);
                        this.onError(res.message);
                    }));
    }

    changeAnnotation() {
        if (this.annotation) {
            this.getRectangles();
        }
        this.dataService.annotation = this.annotation;
    }

    getRectangles() {
        this.subscriptions.push(
            this.rectangleService.queryWithAnnotationId(this.annotation.id)
            .subscribe(
                (res: HttpResponse<Map<string, Rectangle>>) => {
                    this.log.d('rectangles:', res.body);
                    this.dataService.notifyRedraw(res.body);
                    this.dialogRef.close();
                },
                (res: HttpErrorResponse) => {
                    this.onError(res.message);
                    this.log.er(res.message);
                    this.dataService.notifyRedraw(new Map<string, Rectangle>());
                    this.dialogRef.close();
                }));
    }

    loadScaleOrPopout(defect) {
        this.subscriptions.push(
            this.annotationService.queryWithImageIdDefectAndSquareSize(
                this.image.id, this.squareSize, defect).subscribe(
                    (res: HttpResponse<Annotation>) => {
                        const a = res.body;
                        this.log.d('annotation:', a);
                        this.rectangleService.queryWithAnnotationId(a.id).subscribe(
                            (response: HttpResponse<Map<string, Rectangle>>) => {
                                this.rectangles2 = response.body;
                                this.log.d('rectangles for a:', response.body);
                        },
                            (response: HttpErrorResponse) => {
                                this.onError(response.message);
                                this.log.er(response.message);
                            });
                    },
                    (res: HttpErrorResponse) => {
                        this.log.er(res.message);
                        this.onError(res.message);
                    }));
    }

    openLoadingDialog() {
        this.dialogRef = this.dialog.open(LoadingDialogComponent, {
            disableClose: true,
            width: '50%'
        });
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }
}

@Component({
    selector: 'jhi-loading-dialog',
    template: '<h1 style="text-align:center;">NOW LOADING...</h1><mat-spinner style="margin:0 auto;"></mat-spinner>'
})
export class LoadingDialogComponent {
    constructor() {}
}
