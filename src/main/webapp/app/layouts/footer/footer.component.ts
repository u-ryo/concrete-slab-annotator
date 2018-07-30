import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Level, Log } from 'ng2-logger/client';
import { NavigationEnd, Router } from '@angular/router';
import { Principal } from '../../shared';
import { SharedStorage, SharedStorageService } from 'ngx-store';

@Component({
    selector: 'jhi-footer',
    templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {
    footerClass = 'right-footer';
    isMinimized = false;
    @ViewChild('img') img;
    @ViewChild('minimizer') minimizer;
    @ViewChild('maximizer') maximizer;
    @ViewChild('canvas') canvas;
    @ViewChild('statusCloser') statusCloser;
    @SharedStorage() fileUrl;
    @SharedStorage() cropX = 0;
    @SharedStorage() cropY = 0;
    @SharedStorage() virtualImageWidth = 1;
    @SharedStorage() virtualImageHeight = 1;
    @SharedStorage() rate = 1;
    @SharedStorage() rightEnd = 1;
    @SharedStorage() bottomEnd = 1;
    context: CanvasRenderingContext2D;
    ratio = 1;
    private isMouseDown = false;
    cursor = 'pointer';
    private log = Log.create('footer', Level.ERROR, Level.WARN, Level.INFO);
    @SharedStorage() dirty;
    status = undefined;
    statusClass = 'd-none';

    constructor(private sharedStorageService: SharedStorageService,
                private principal: Principal,
                private renderer: Renderer2,
                private router: Router) {}

    ngOnInit() {
        this.renderer.listen(this.minimizer.nativeElement, 'click',
                             (event) => this.minimize());
        this.renderer.listen(this.maximizer.nativeElement, 'click',
                             (event) => this.maximize());
        this.renderer.listen(this.statusCloser.nativeElement, 'click',
                             (event) => {
                                 this.statusClass = 'd-none';
                             });
        this.sharedStorageService.observe('cropX').subscribe(
            (x) => this.drawRectangle(x));
        this.sharedStorageService.observe('cropY').subscribe(
            (y) => this.drawRectangle(y));
        this.sharedStorageService.observe('dirty').subscribe(
            (dirty) => this.setStatus(dirty));
        this.renderer.listen(this.canvas.nativeElement, 'mousedown',
                             (event) => {
                                 this.isMouseDown = true;
                                 this.cursor = 'move';
                             });
        this.renderer.listen(this.canvas.nativeElement, 'mouseup',
                             (event) => {
                                 this.isMouseDown = false;
                                 this.cursor = 'pointer';
                             });
        this.renderer.listen(
            this.canvas.nativeElement, 'mousemove', (event) => {
                if (this.isMouseDown) {
                    this.cursor = 'move';
                    this.drag(event.layerX, event.layerY,
                              event.movementX, event.movementY);
                }
            });
        this.router.events.filter((event) => event instanceof NavigationEnd)
            .subscribe((event: NavigationEnd) => {
                this.log.d(`router:`, this.router, `event:`, event);
                this.log.d(`event.url:${event.url}`);
                if (event.url === '/' || event.url.lastIndexOf('/?', 0) === 0) {
                    this.maximize();
                } else {
                    this.minimize();
                    this.statusClass = 'd-none';
                }
            });
    }

    minimize() {
        this.footerClass = 'minimized-footer';
        this.isMinimized = true;
    }

    maximize() {
        this.footerClass = 'right-footer';
        this.isMinimized = false;
        setTimeout(() => this.afterLoading(), 500);
    }

    afterLoading() {
        this.canvas.nativeElement.style.width
            = `${this.img.nativeElement.offsetWidth}px`;
        this.canvas.nativeElement.width = this.img.nativeElement.offsetWidth;
        this.canvas.nativeElement.style.height
            = `${this.img.nativeElement.offsetHeight}px`;
        this.canvas.nativeElement.height = this.img.nativeElement.offsetHeight;
        this.context = this.canvas.nativeElement.getContext('2d');
        this.context.fillStyle = 'rgba(192, 80, 77, 0.5)';
        this.ratio = this.img.nativeElement.offsetWidth
            / this.img.nativeElement.naturalWidth;
        this.log.d(`img.offsetWidth:${this.img.nativeElement.offsetWidth},`
                   + `naturalWidth:${this.img.nativeElement.naturalWidth},`
                   + `ratio:${this.ratio},`
                   + `canvas.width:${this.canvas.nativeElement.width}`
                  );
        this.drawRectangle(0);
        this.statusClass = 'd-none';
    }

    drawRectangle(x) {
        this.log.d('x:', x, 'cropX:', this.cropX);
        this.context.clearRect(0, 0, this.canvas.nativeElement.width,
                               this.canvas.nativeElement.height);
        this.log.d(`virtualImageWidth:${this.virtualImageWidth},`
                   + `ratio:${this.ratio},`
                  );
        this.context.fillRect(this.cropX * this.ratio * this.rate,
                              this.cropY * this.ratio * this.rate,
                              this.virtualImageWidth * this.ratio,
                              this.virtualImageHeight * this.ratio);
    }

    drag(x, y, movementX, movementY) {
        this.log.d(
            `cropX:${this.cropX},x:${x},movementX:${movementX},`
                + `x/ratio:${x / this.ratio},`
                + `movementX/ratio:${movementX / this.ratio}`
                + `movementX/ratio/rate:${movementX / this.ratio / this.rate}`
        );
        const currentX = this.cropX + (movementX / this.ratio / this.rate);
        if (currentX >= 0 && currentX <= this.rightEnd) {
            this.cropX = currentX;
        }
        const currentY = this.cropY + (movementY / this.ratio / this.rate);
        if (currentY >= 0 && currentY <= this.bottomEnd) {
            this.cropY = currentY;
        }
    }

    setStatus(dirty) {
        this.log.d(`${dirty.key}:${dirty.oldValue}->${dirty.newValue}`);
        this.status = this.dirty ? 'CHANGED' : 'SAVED';
        this.statusClass = 'alert alert-' + (this.dirty ? 'warning' : 'success');
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }
}
