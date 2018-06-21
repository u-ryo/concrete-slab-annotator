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
    private subscription: Subscription;
    cameras = Object.keys(Camera);
    defects = Object.keys(DefectName);
    images;
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

    constructor(private annotationService: AnnotationService,
                private dataService: DataService,
                private formBuilder: FormBuilder,
                private imageService: ImageService,
                private jhiAlertService: JhiAlertService,
                private rectangleService: RectangleService) {
        if (!DEBUG_INFO_ENABLED) {
            Log.setProductionMode();
        }
        this.log.d('constructor called.');
    }

    loadAll() {
        this.imageService.query().subscribe(
            (res: HttpResponse<Image[]>) => {
                this.images = res.body;
                this.log.d(`filename:${this.filename}, images:`, this.images);
                if (this.filename) {
                    const imgs = this.images.filter(
                        (i) => i.filename === this.filename);
                    this.log.d('imgs:', imgs);
                    if (imgs.length > 0) {
                        this.image = imgs[0];
                        this.log.d('image00.filename:', this.image,
                                   'imgs[0].filename:', imgs[0].filename);
                    }
                }
                this.log.d('image0:', this.image,
                           'image.filename:', this.image.filename);
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
        );
    }

    ngOnInit() {
        this.loadAll();
        this.subscription = this.dataService.commentData$
            .subscribe((comment) => this.setComment(comment));
        this.createForm();
        this.log.d('defects:', this.defects);
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
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
            brightnessLevel: this.brightness,
            comment: { value: '', disabled: true }
        });
        this.inputForm.get('squareSize').valueChanges
            .debounceTime(500)
            .subscribe((squareSize) => {
                this.squareSize = squareSize;
                this.changeSize();
            });
        this.inputForm.get('distance').valueChanges
            .debounceTime(500)
            .subscribe((distance) => {
                this.distance = distance;
                this.changeSize();
            });
        this.inputForm.get('focalLength').valueChanges
            .debounceTime(500)
            .subscribe((focalLength) => {
                this.focalLength = focalLength;
                this.changeSize();
            });
        this.inputForm.get('defect').valueChanges
            .debounceTime(500)
            .subscribe((defect) => this.loadAnnotation(defect));
        this.inputForm.get('fileUrlField').valueChanges
            .debounceTime(1000)
            .subscribe((fileUrl) => this.setImage(fileUrl));
        this.inputForm.get('brightnessLevel').valueChanges
            .debounceTime(500)
            .forEach((brightness) => this.brightness = brightness);
        this.dataService.form = this.inputForm;
    }

    rebuildForm() {
        this.inputForm.reset({
            fileUrlField: this.image
                ? this.image.filename : this.images[0].filename,
            distance: this.distance,
            focalLength: this.focalLength,
            squareSize: (this.annotation && this.annotation.squareSize)
                ? this.annotation.squareSize : this.squareSize,
            camera: this.image ? this.image.camera : this.images[0].camera,
            columns: 153,
            rows: 115,
            defect: (this.annotation && this.annotation.defect)
                ? this.annotation.defect : this.defects[0],
            pending: false,
            brightnessLevel: this.brightness,
            comment: { value: '', disabled: true }
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
        const baseValue = this.distance * 0.46 / this.focalLength
            / this.squareSize;
        this.log.d('squareSize:', this.inputForm.value.squareSize,
                   'image.naturalWidth:', this.dataService.image.naturalWidth,
                   'columns:', Math.round(
                       baseValue * this.dataService.image.naturalWidth));
        this.inputForm.controls['columns'].setValue(
            Math.round(baseValue * this.dataService.image.naturalWidth),
            {emitEvent: false});
        this.inputForm.controls['rows'].setValue(
            Math.round(baseValue * this.dataService.image.naturalHeight),
            {emitEvent: false});
        this.log.d('focalLength:', this.focalLength,
                   'distance:', this.distance,
                   'squareSize:', this.squareSize,
                   'rows:', this.inputForm.value.rows);
        this.dataService.form = this.inputForm;
    }

    setComment(comment) {
        this.inputForm.controls['comment'].setValue(comment.comment,
                                                    {emitEvent: false});
        this.coordinate = { coordinate: comment.coordinate };
        if (comment.showOnly) {
            this.inputForm.controls['comment'].disable({emitEvent: false});
        } else {
            this.inputForm.controls['comment'].enable({emitEvent: false});
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
            return;
        }
        this.image = imgs[0];
        this.focalLength = this.image.focalLength;
        this.distance = this.image.distance;
        this.inputForm.controls['focalLength'].setValue(this.image.focalLength,
                                                        {emitEvent: false});
        this.inputForm.controls['distance'].setValue(this.image.distance,
                                                     {emitEvent: false});
        this.inputForm.controls['camera'].setValue(this.image.camera,
                                                   {emitEvent: false});
        this.inputForm.controls['defect'].setValue(
            this.annotation ? this.annotation.defect : this.defects[0],
            {emitEvent: false});
        this.brightness = 100;
        this.inputForm.controls['brightnessLevel'].setValue(this.brightness);
        this.log.d(`brightness:${this.brightness},`
                   + `brightnessLevel:${this.inputForm.value.brightnessLevel}`);
        this.squareSize = this.annotation ? this.annotation.squareSize : 2;
        this.loadAnnotation(this.inputForm.value.defect);
    }

    loadAnnotation(defect) {
        this.annotationService.queryWithImageIdDefectAndSquareSize(
            this.image.id, this.squareSize, defect).subscribe(
                (res: HttpResponse<Annotation>) => {
                    this.annotation = res.body;
                    this.log.d('annotation:', this.annotation);
                    this.changeAnnotation();
                },
                (res: HttpErrorResponse) => {
                    this.log.er(res.message);
                    this.onError(res.message);
                });
    }

    changeAnnotation() {
        if (this.annotation) {
            this.getRectangles();
        }
        this.dataService.annotation = this.annotation;
    }

    getRectangles() {
        this.rectangleService.queryWithAnnotationId(this.annotation.id)
            .subscribe(
                (res: HttpResponse<Map<string, Rectangle>>) => {
                    this.log.d('rectangles:', res.body);
                    this.dataService.notifyRedraw(res.body);
                },
                (res: HttpErrorResponse) => {
                    this.onError(res.message);
                    this.log.er(res.message);
                    this.dataService.notifyRedraw(new Map<string, Rectangle>());
                });
    }
}
