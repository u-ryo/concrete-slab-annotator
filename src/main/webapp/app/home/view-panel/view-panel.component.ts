import { Component, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DataService } from '../../shared/data.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { JhiAlertService } from 'ng-jhipster';
import { Level, Log } from 'ng2-logger/client';
import { Observable } from 'rxjs/Observable';
import { Rectangle } from '../../entities/rectangle/rectangle.model';
import { RectangleService } from '../../entities/rectangle/rectangle.service';
import { Router } from '@angular/router';
import { SharedStorage, SharedStorageService } from 'ngx-store';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/Rx';

@Component({
  selector: 'jhi-view-panel',
  templateUrl: './view-panel.component.html',
  styles: []
})
export class ViewPanelComponent implements OnDestroy, OnInit {
    context: CanvasRenderingContext2D;
    @ViewChild('img') img;
    @ViewChild('canvas') canvas;
    private CHECK_INTERVAL = 5000;
    @SharedStorage() cropX = 0;
    @SharedStorage() cropY = 0;
    private intervalX = 0;
    private intervalY = 0;
    private magnification = 1;
    private isMouseDown = false;
    private hasMouseMoved = false;
    private rectangles = new Map<string, Rectangle>();
    @SharedStorage() rightEnd = 1;
    @SharedStorage() bottomEnd = 1;
    @SharedStorage() fileUrl;
    @SharedStorage() rate = 1;
    loading = true;
    @SharedStorage() virtualImageWidth = 1;
    @SharedStorage() virtualImageHeight = 1;
    private MINIMUM_MAGNIFICATION = 0.3;
    private MAGNIFICATION_START = 2;
    private coordinate = '';
    brightness = this.sanitizer.bypassSecurityTrustStyle(`brightness(100%)`);
    private clickCounter = 0;
    private subscription: Subscription;
    private dirty = false;
    private timerObservable = Observable.interval(this.CHECK_INTERVAL);
    cursor = 'auto';
    private log = Log.create('view-panel', Level.ERROR, Level.WARN, Level.INFO);

    constructor(private dataService: DataService,
                private sanitizer: DomSanitizer,
                private jhiAlertService: JhiAlertService,
                private rectangleService: RectangleService,
                private renderer: Renderer2,
                private router: Router,
                private sharedStorageService: SharedStorageService) {}

    ngOnInit() {
        this.subscription = this.dataService.redrawData$.subscribe((r) => {
            this.rectangles = r;

            this.log.d('subscribe called');
            this.intervalX = this.canvas.nativeElement.width
                * this.magnification / this.dataService.form.value.columns;
            this.intervalY = this.canvas.nativeElement.height
                * this.magnification / this.dataService.form.value.rows;
            this.log.d('redraw intervalX:', this.intervalX);
            this.drawCanvas();
        });
        this.renderer.listen(this.canvas.nativeElement, 'mouseup', (event) => {
            this.isMouseDown = false;
            this.cursor = 'auto';
        });
        this.renderer.listen(
            this.canvas.nativeElement, 'mousedown', (event) => {
                this.isMouseDown = true;
                this.hasMouseMoved = false;
            });
        this.renderer.listen(
            this.canvas.nativeElement, 'mousemove', (event) => {
                this.log.d('event:', event);
                if (event.ctrlKey && event.shiftKey) {
                    if (this.magnification > this.MAGNIFICATION_START) {
                        this.cursor = 'brush';
                        this.click(event, true, true);
                    }
                } else if (event.ctrlKey && !event.shiftKey) {
                    if (this.magnification > this.MAGNIFICATION_START) {
                        this.cursor = 'eraser';
                        this.click(event, false, false);
                    }
                } else if (!event.ctrlKey && event.shiftKey) {
                    if (this.magnification > this.MAGNIFICATION_START) {
                        this.cursor = 'pencil';
                        this.click(event, true, false);
                    }
                } else if (this.isMouseDown) {
                    if (this.magnification > 1) {
                        this.cursor = 'move';
                        this.drag(event.layerX, event.layerY,
                                  event.movementX, event.movementY);
                    }
                } else {
                    this.cursor = 'auto';
                    this.checkComment(event.layerX, event.layerY);
                }
            });
        this.renderer.listen(this.canvas.nativeElement, 'click',
                             (event) => this.onclick(event, true));
        this.renderer.listen(this.canvas.nativeElement, 'dblclick',
                             (event) => this.onclick(event, false));
        this.renderer.listen(this.canvas.nativeElement, 'pinch',
                             (event) => this.pinch(event));
        this.dataService.form.get('comment').valueChanges
            .debounceTime(500)
            .subscribe((comment) => this.setComment(comment));
        this.dataService.form.get('fileUrlField').valueChanges
            .debounceTime(1000)
            .forEach((url) => {
                this.loading = true;
                this.fileUrl = url;
                this.brightness = this.sanitizer.bypassSecurityTrustStyle(
                    `brightness(${this.dataService.form.value.brightnessLevel}%)`);
                this.magnification = 1;
                this.cropX = 0;
                this.cropY = 0;
                this.isMouseDown = false;
                this.hasMouseMoved = false;
                this.log.i(`url:${url}`);
                this.dataService.form.controls['fileUrlField'].setValue(
                    url, {emitEvent: false});
            });
        this.dataService.form.get('columns').valueChanges
            .debounceTime(500)
            .subscribe(
                (columns) => {
                    this.intervalX = this.canvas.nativeElement.width
                        * this.magnification / columns;
                    this.drawCanvas();
                    this.log.d('columns:', columns,
                               this.dataService.form.value.columns);
                });
        this.dataService.form.get('rows').valueChanges
            .debounceTime(500)
            .subscribe(
                (rows) => {
                    this.intervalY = this.canvas.nativeElement.height
                        * this.magnification / rows;
                    this.drawCanvas();
                    this.log.d('rows:', rows, this.dataService.form.value.rows);
                });
        this.dataService.form.get('pending').valueChanges
            .debounceTime(500)
            .subscribe((pending) => this.setPending(pending));
        this.dataService.form.get('brightnessLevel').valueChanges
            .debounceTime(500)
            .subscribe(
                (brightnessLevel) => {
                    this.brightness = this.sanitizer.bypassSecurityTrustStyle(
                        `brightness(${brightnessLevel}%)`);
                    this.drawCanvas();
                    this.log.d('brightness:', this.brightness);
                });
        this.sharedStorageService.observe('cropX').subscribe(
            (x) => this.drawCanvas());
        this.sharedStorageService.observe('cropY').subscribe(
            (y) => this.drawCanvas());
        this.timerObservable.filter((x) => this.dirty).subscribe(
            (x) => this.saveRectangles(x),
            (error) => console.error(`Error: ${error}`),
            () => console.log('Completed')
        );
        this.renderer.listen(
            this.img.nativeElement, 'click', (event) => this.loading = false);
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    afterLoading() {
        this.router.navigate([''], {
            queryParams: { filename: this.dataService.form.value.fileUrlField }});
        this.log.d(`img.offsetHeight:${this.img.nativeElement.offsetHeight},`
                   + `loading:${this.loading}`);
        if (this.img.nativeElement.offsetHeight === 0) {
            this.loading = false;
            this.drawCanvas();
            return;
        }
        this.dataService.image = this.img.nativeElement;
        this.canvas.nativeElement.style.width =
            `${this.img.nativeElement.offsetWidth}px`;
        this.canvas.nativeElement.width = this.img.nativeElement.offsetWidth;
        this.canvas.nativeElement.style.height =
            `${this.img.nativeElement.offsetHeight}px`;
        this.canvas.nativeElement.height = this.img.nativeElement.offsetHeight;
        this.rate = this.img.nativeElement.naturalWidth
            / (this.canvas.nativeElement.width * this.magnification);
        this.rightEnd = 0;
        this.bottomEnd = 0;
        this.context = this.canvas.nativeElement.getContext('2d');
        this.loading = false;
        this.intervalX = this.canvas.nativeElement.width
            / this.dataService.form.value.columns;
        this.intervalY = this.canvas.nativeElement.height
            / this.dataService.form.value.rows;
        this.virtualImageWidth =
            this.img.nativeElement.naturalWidth / this.magnification;
        this.virtualImageHeight =
            this.img.nativeElement.naturalHeight / this.magnification;
        this.log.d(`canvas height:${this.canvas.nativeElement.height}`,
                   `img offsetHeight:${this.img.nativeElement.offsetHeight}`,
                   `loading:${this.loading}`,
                   `intervalX:${this.intervalX}`);
        this.drawCanvas();
    }

    drawCanvas() {
        this.log.d('drawCanvas context:', this.context);
        if (this.magnification < 1) {
            this.context.clearRect(0, 0, this.canvas.nativeElement.width,
                                   this.canvas.nativeElement.height);
        }
        if (!this.context) {
            return;
        }
        this.log.d('img:', this.img.nativeElement.src,
                   this.img.nativeElement.src.endsWith('.jpg'));
        try {
            this.context.drawImage(
                this.img.nativeElement,
                this.cropX * this.rate, this.cropY * this.rate,
                this.virtualImageWidth, this.virtualImageHeight,
                0, 0, this.canvas.nativeElement.width,
                this.canvas.nativeElement.height);
        } catch (error) {
            console.error(error);
            return;
        }
        if (this.magnification > this.MAGNIFICATION_START) {
            this.drawLattices();
        }
        this.drawRectangles();
    }

    drawLattices() {
        let delta = this.cropX % this.intervalX;
        let max = (this.canvas.nativeElement.width / this.intervalX) + 1;
        this.log.d('delta:', delta, 'max:', max);
        this.context.beginPath();
        for (let i = 0; i < max; i++) {
            this.context.moveTo(i * this.intervalX - delta, 0);
            this.context.lineTo(i * this.intervalX - delta,
                                this.canvas.nativeElement.height);
        }
        delta = this.cropY % this.intervalY;
        max = this.canvas.nativeElement.height / this.intervalY;
        for (let j = 0; j < max; j++) {
            this.context.moveTo(0, j * this.intervalY - delta);
            this.context.lineTo(this.canvas.nativeElement.width,
                                j * this.intervalY - delta);
        }
        this.context.stroke();
    }

    drawRectangles() {
        const rectangleMinX = Math.floor(this.cropX / this.intervalX);
        const rectangleMinY = Math.floor(this.cropY / this.intervalY);
        const rectangleMaxX = Math.ceil(
            (this.cropX + this.canvas.nativeElement.width) / this.intervalX);
        const rectangleMaxY = Math.ceil(
            (this.cropY + this.canvas.nativeElement.height) / this.intervalY);
        for (let i = rectangleMinX; i <= rectangleMaxX; i++) {
            for (let j = rectangleMinY; j <= rectangleMaxY; j++) {
                const coordinate = i + ',' + j;
                if (this.rectangles[coordinate]) {
                    if (this.rectangles[coordinate].pending) {
                        this.context.fillStyle = 'rgba(80, 77, 192, 0.5)';
                    } else {
                        this.context.fillStyle = 'rgba(192, 80, 77, 0.5)';
                    }
                    this.context.fillRect(
                        i * this.intervalX - this.cropX,
                        j * this.intervalY - this.cropY,
                        this.intervalX, this.intervalY);
                    if (this.rectangles[coordinate].comment) {
                        this.drawFrame(i, j, 'rgba(180, 192, 77, 0.8)');
                    }
                }
                if (this.coordinate === coordinate) {
                    this.drawFrame(i, j, 'rgba(77, 192, 80, 0.8)');
                }
            }
        }
    }

    private drawFrame(i, j, color) {
        this.context.lineWidth = 5;
        this.context.strokeStyle = color;
        this.context.strokeRect(i * this.intervalX - this.cropX,
                                j * this.intervalY - this.cropY,
                                this.intervalX, this.intervalY);
        this.context.lineWidth = 1;
        this.context.strokeStyle = 'rgba(0, 0, 0, 1)';
    }

    mouseWheel(event) {
        this.log.d('mouse wheel', event, event.wheelDelta, -event.detail);
        this.magnification
            += (event.wheelDelta * 0.001) || (-event.detail * 0.01);
        this.magnify(event.layerX, event.layerY);
    }

    pinch(event) {
        console.log('pinch:', event.scale * 0.01, event.center.x, event);
        this.magnification += event.scale * 0.01;
        this.magnify(event.center.x, event.center.y);
    }

    magnify(x, y) {
        if (this.magnification < this.MINIMUM_MAGNIFICATION) {
            this.magnification = this.MINIMUM_MAGNIFICATION;
        }
        const originalX = (this.cropX + x) * this.rate;
        const originalY = (this.cropY + y) * this.rate;
        this.rate = this.img.nativeElement.naturalWidth
            / (this.canvas.nativeElement.width * this.magnification);
        this.cropX = (originalX / this.rate) - x;
        this.cropY = (originalY / this.rate) - y;
        this.virtualImageWidth =
            this.img.nativeElement.naturalWidth / this.magnification;
        this.virtualImageHeight =
            this.img.nativeElement.naturalHeight / this.magnification;
        this.rightEnd = this.magnification * this.canvas.nativeElement.width
            - this.canvas.nativeElement.width;
        this.bottomEnd = this.magnification * this.canvas.nativeElement.height
            - this.canvas.nativeElement.height;
        this.intervalX = this.canvas.nativeElement.width * this.magnification
            / this.dataService.form.value.columns;
        this.intervalY = this.canvas.nativeElement.height * this.magnification
            / this.dataService.form.value.rows;
        this.cropX = Math.max(0, Math.min(this.cropX, this.rightEnd));
        this.cropY = Math.max(0, Math.min(this.cropY, this.bottomEnd));
        this.log.d('magnification:', this.magnification,
                   'cropX:', this.cropX,
                   'rate:', this.rate,
                   'virtualImageWidth', this.virtualImageWidth,
                   'rightEnd:', this.rightEnd,
                   'intervalX:', this.intervalX);
        this.drawCanvas();
    }

    drag(x, y, movementX, movementY) {
        const currentX = this.cropX - movementX;
        this.log.d('currentX:', currentX,
                   'rightEnd', this.rightEnd,
                   'virtualImageWidth:', this.virtualImageWidth,
                   this.magnification);
        if (currentX >= 0 && currentX <= this.rightEnd) {
            this.cropX = currentX;
        }
        const currentY = this.cropY - movementY;
        if (currentY >= 0 && currentY <= this.bottomEnd) {
            this.cropY = currentY;
        }
        this.drawCanvas();
        this.hasMouseMoved = true;
    }

    onclick(event, isSingleClick) {
        this.clickCounter++;
        setTimeout(() => {
            this.log.d('onclick event:', event, 'isSingleClick:',
                       isSingleClick, this.clickCounter);
            if (isSingleClick && this.clickCounter === 1) {
                this.click(event, true, false);
            } else if (!isSingleClick) {
                this.click(event, false, false);
            }
            this.clickCounter = 0;
        }, 200);
    }

    click(event, isSingleClick, isThick) {
        this.log.d('click event:', event, 'isSingleClick:', isSingleClick,
                   this.clickCounter);
        if (this.magnification <= this.MAGNIFICATION_START) {
            return;
        }
        if (this.hasMouseMoved && !event.shiftKey && !event.ctrlKey) {
            return;
        }
        this.isMouseDown = false;
        const rectangleX =
            Math.floor((event.layerX + this.cropX) / this.intervalX);
        const rectangleY =
            Math.floor((event.layerY + this.cropY) / this.intervalY);
        this.coordinate = rectangleX + ',' + rectangleY;
        this.dataService.notifyComment({
            coordinate: this.coordinate,
            comment: (this.rectangles[this.coordinate]
                      ? this.rectangles[this.coordinate].comment : ''),
            showOnly: false
        });
        if (isSingleClick) {
            if (!isThick) {
                this.drawCreateRectangle(rectangleX, rectangleY);
            } else {
                Observable.from([-1, 0, 1]).forEach(
                    (i) => Observable.from([-1, 0, 1]).forEach(
                        (j) => this.drawCreateRectangle(
                            rectangleX + i, rectangleY + j)));
            }
            this.log.d('rectangles[', this.coordinate, ']:',
                       this.rectangles[this.coordinate]);
        } else if (!isSingleClick && this.rectangles[this.coordinate]) {
            delete(this.rectangles[this.coordinate]);
            this.dirty = true;
        }
        this.drawCanvas();
    }

    drawCreateRectangle(x, y) {
        this.log.d(`drawCreateRectangle(${x},${y})`);
        if (x < 0 || y < 0 || x >= this.dataService.form.value.columns
            || y >= this.dataService.form.value.rows) {
            return;
        }
        const coordinate = `${x},${y}`;
        if (!this.rectangles[coordinate]) {
            this.createRectangleXY(
                this.dataService.form.value.pending, '', x, y);
            this.dirty = true;
        } else if (this.rectangles[coordinate].pending
                   !== this.dataService.form.value.pending) {
            this.rectangles[coordinate].pending =
                this.dataService.form.value.pending;
            this.dirty = true;
        }
    }

    setPending(pending) {
        if (this.magnification > this.MAGNIFICATION_START && this.coordinate) {
            this.log.d(`rectangles: ${this.rectangles[this.coordinate]}`);
            if (!this.rectangles[this.coordinate]) {
                this.log.d(`pending:${pending}, `
                           + `rectangles:${this.rectangles[this.coordinate]}`);
                this.createRectangle(pending,
                                     this.dataService.form.value.comment);
            } else {
                this.log.d(`pending:${pending}`);
                this.rectangles[this.coordinate].pending = pending;
            }
            this.drawCanvas();
        }
    }

    setComment(comment) {
        if (!this.rectangles[this.coordinate]) {
            this.createRectangle(this.dataService.form.value.pending, comment);
        } else {
            this.rectangles[this.coordinate].comment = comment;
        }
        this.log.d('setComment:', comment, this.dataService.form.value.comment,
                   'coordinate:', this.coordinate);
        this.dirty = true;
    }

    private createRectangle(pending, comment) {
        const rectangleX = parseInt(this.coordinate.split(',')[0], 10);
        const rectangleY = parseInt(this.coordinate.split(',')[1], 10);
        this.createRectangleXY(pending, comment, rectangleX, rectangleY);
    }

    private createRectangleXY(pending, comment, rectangleX, rectangleY) {
        this.log.d('createRectangleXY().x:',
                   rectangleX * this.intervalX * this.rate);
        this.rectangles[`${rectangleX},${rectangleY}`] = <Rectangle>{
            x: rectangleX * this.intervalX * this.rate,
            y: rectangleY * this.intervalY * this.rate,
            width: this.intervalX * this.rate,
            height: this.intervalY * this.rate,
            coordinateX: rectangleX,
            coordinateY: rectangleY,
            pending,
            comment
        };
    }

    saveRectangles(x) {
        this.log.d(`Next: ${x}, rectangles: `
                   + `${JSON.stringify(Object.keys(this.rectangles))}`);
        this.rectangleService.saveRectangles(
            this.dataService.annotation.id,
            Object.keys(this.rectangles).map((k) => this.rectangles[k]))
            .subscribe(
                (res) => {
                    this.log.d(`res:${res}`);
                    this.dirty = false;
                },
                (res: HttpErrorResponse) => {
                    console.error(res.message);
                    this.onError(res.message);
                });
    }

    private checkComment(x, y) {
        const rectangleX = Math.floor((x + this.cropX) / this.intervalX);
        const rectangleY = Math.floor((y + this.cropY) / this.intervalY);
        const localCoordinate = rectangleX + ',' + rectangleY;
        if (this.rectangles[localCoordinate]
            && this.rectangles[localCoordinate].comment) {
            this.dataService.notifyComment({
                coordinate: localCoordinate,
                comment: this.rectangles[localCoordinate].comment,
                showOnly: true
            });
            this.log.d(`comment: ${this.rectangles[localCoordinate].comment}`);
        }
    }

    private onError(error) {
        this.jhiAlertService.error(error.message, null, null);
    }
}
