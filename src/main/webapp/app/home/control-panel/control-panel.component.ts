import { Annotation, DefectName } from '../../entities/annotation/annotation.model';
import { AnnotationService } from '../../entities/annotation/annotation.service';
import { Camera, Image } from '../../entities/image/image.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../../shared/data.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { ImageService } from '../../entities/image/image.service';
import { JhiAlertService } from 'ng-jhipster';
import { LocalStorage } from 'ngx-store';
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
    coordinate = { coordinate: 'this image' };
    private focalLength = 0;
    private distance = 0;
    private squareSize = 2;
    @LocalStorage() annotation: Annotation;
    @LocalStorage() brightness: number;
    auto;
    comment;

    constructor(private annotationService: AnnotationService,
                private dataService: DataService,
                private formBuilder: FormBuilder,
                private imageService: ImageService,
                private jhiAlertService: JhiAlertService,
                private rectangleService: RectangleService) {
        // console.log('constructor called.');
    }

    loadAll() {
        this.imageService.query().subscribe(
            (res: HttpResponse<Image[]>) => {
                this.images = res.body;
                // console.log('images:', this.images);
                this.image = this.image ? this.image : this.images[0];
                this.distance = this.image.distance;
                this.focalLength = this.image.focalLength;
                this.rebuildForm();
                this.inputForm.controls['fileUrlField'].setValue(
                    this.image.filename);
            },
            (res: HttpErrorResponse) => {
                console.error(res.message);
                this.onError(res.message);
            }
        );
    }

    ngOnInit() {
        this.loadAll();
        this.subscription = this.dataService.commentData$
            .subscribe((comment) => this.setComment(comment));
        this.createForm();
        // console.log('defects:', this.defects);
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
            comment: ''
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
            comment: ''
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
        // console.log('squareSize:', this.squareSize, 'annotation:', this.annotation);
        if (this.squareSize !== this.annotation.squareSize) {
            this.loadAnnotation(this.inputForm.value.defect);
        }
        const baseValue = this.distance * 0.45988223999999995 / this.focalLength
            / this.squareSize;
        // console.log('squareSize:', this.inputForm.value.squareSize,
        //             'image.naturalWidth:', this.dataService.image.naturalWidth,
        //             'columns:', Math.round(
        //                 baseValue * this.dataService.image.naturalWidth));
        this.inputForm.controls['columns'].setValue(
            Math.round(baseValue * this.dataService.image.naturalWidth),
            {emitEvent: false});
        this.inputForm.controls['rows'].setValue(
            Math.round(baseValue * this.dataService.image.naturalHeight),
            {emitEvent: false});
        // console.log('focalLength:', this.focalLength,
        //             'distance:', this.distance,
        //             'squareSize:', this.squareSize,
        //             'rows:', this.inputForm.value.rows);
        this.dataService.form = this.inputForm;
    }

    setComment(comment) {
        this.inputForm.controls['comment'].setValue(comment.comment,
                                                    {emitEvent: false});
        this.coordinate = { coordinate: comment.coordinate };
        // console.log('comment from view:', comment);
    }

    setImage(fileUrl) {
        // console.log(`fileUrl:${fileUrl}`);
        if (!fileUrl.endsWith('jpg') && !fileUrl.endsWith('png')) {
            return;
        }
        const imgs = this.images.filter((i) => i.filename === fileUrl);
        // console.log('imgs:', imgs, 'images:', this.images);
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
        // console.log(`brightness:${this.brightness},brightnessLevel:${this.inputForm.value.brightnessLevel}`);
        this.squareSize = this.annotation ? this.annotation.squareSize : 2;
        this.loadAnnotation(this.inputForm.value.defect);
    }

    loadAnnotation(defect) {
        this.annotationService.queryWithImageIdDefectAndSquareSize(
            this.image.id, this.squareSize, defect).subscribe(
                (res: HttpResponse<Annotation>) => {
                    this.annotation = res.body;
                    // console.log('annotation:', this.annotation);
                    this.changeAnnotation();
                },
                (res: HttpErrorResponse) => {
                    console.error(res.message);
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
                    // console.log('rectangles:', res.body);
                    this.dataService.rectangles = res.body;
                    this.dataService.notifyRedraw();
                },
                (res: HttpErrorResponse) => {
                    this.onError(res.message);
                    console.error(res.message);
                    this.dataService.rectangles = new Map<string, Rectangle>();
                    this.dataService.notifyRedraw();
                });
    }
}
