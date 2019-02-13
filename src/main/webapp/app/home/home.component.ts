import { Annotation } from '../entities/annotation/annotation.model';
import { Component, Inject, OnInit } from '@angular/core';
import { Image } from '../entities/image/image.model';
import { JhiEventManager } from 'ng-jhipster';
import { JhiLanguageService } from 'ng-jhipster';
import { Level, Log } from 'ng2-logger/client';
import { LoginService } from '../shared';
import { LocalStorage, SharedStorage } from 'ngx-store';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { Account, LoginModalService, Principal } from '../shared';
import { DownloadFileService } from '../shared/downloadFile.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface CompareDialogData {
    from: string;
    to: string;
    images: Image[];
}

@Component({
    selector: 'jhi-home',
    templateUrl: './home.component.html',
    styleUrls: [ 'home.css' ]
})
export class HomeComponent implements OnInit {
    account: Account;
    modalRef: NgbModalRef;
    language = 'en';
    @SharedStorage() filename: string;
    @LocalStorage() annotation: Annotation;
    @SharedStorage() images: Image[];
    private log = Log.create('home', Level.ERROR, Level.WARN, Level.INFO);

    constructor(
        public dialog: MatDialog,
        private downloadFileService: DownloadFileService,
        private eventManager: JhiEventManager,
        private languageService: JhiLanguageService,
        private loginModalService: LoginModalService,
        private loginService: LoginService,
        private principal: Principal,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.account = account;
        });
        this.registerAuthenticationSuccess();
    }

    registerAuthenticationSuccess() {
        this.eventManager.subscribe('authenticationSuccess', (message) => {
            this.principal.identity().then((account) => {
                this.account = account;
            });
        });
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }

    changeLanguage(languageKey: string) {
        this.language = this.language === 'ja' ? 'en' : 'ja';
        this.languageService.changeLanguage(languageKey);
    }

    logout() {
        this.loginService.logout();
        this.router.navigate(['']);
    }

    downloadCsv() {
        this.downloadFileService.results(
            'api/access-logs/csv', 'accesslog.csv');
    }

    downloadAnnotationXml() {
        this.log.i(`filename:${this.filename}`);
        const f = this.filename.substring(this.filename.lastIndexOf('/') + 1);
        this.downloadFileService.results(
            `api/rectangles/xml/annotation/${this.annotation.id}`,
            `${f}.${this.annotation.defect}.${this.annotation.squareSize}.xml`);
    }

    downloadImageXml() {
        this.log.i(`filename:${this.filename}`);
        const f = this.filename.substring(this.filename.lastIndexOf('/') + 1);
        this.downloadFileService.results(
            `api/rectangles/xml/image/${this.annotation.image.id}/${this.annotation.squareSize}`,
            `${f}.${this.annotation.squareSize}.xml`);
    }

    downloadImageCsv() {
        this.log.i(`filename:${this.filename}`);
        const f = this.filename.substring(this.filename.lastIndexOf('/') + 1);
        this.downloadFileService.results(
            `api/rectangles/csv/image/${this.annotation.image.id}/${this.annotation.squareSize}`,
            `${f}.${this.annotation.squareSize}.csv`);
    }

    downloadAllXml() {
        const f = 'annotations.zip';
        this.log.i(`filename:${f}`);
        this.downloadFileService.results(
            `api/rectangles/xml/${this.annotation.squareSize}/all`, f);
    }

    openCompareDialog() {
        const idx = this.filename.indexOf('Capture');
        const filenameTrunk = this.filename.substring(idx, idx + 12); // 12 = 'CaptureNNNNN'.length
        const dialogRef = this.dialog.open(
            CompareDialogComponent, {
                disableClose: true,
                width: '90%',
                data: {
                    from: this.filename,
                    images: this.images.filter(
                        (i) => i.filename.indexOf(filenameTrunk) > 0
                            && i.filename !== this.filename)
                        .concat(this.images.filter(
                            (i) => i.filename.indexOf(filenameTrunk) < 0
                                && i.filename !== this.filename))
                }});

        dialogRef.afterClosed().subscribe((result) => {
            this.log.d(`result:${result}`);
            if (!result) {
                this.log.er(`result is null for ${this.filename}`);
                return;
            }
            const filename =
                this.filename.substring(this.filename.lastIndexOf('/') + 1,
                                        this.filename.lastIndexOf('.'))
                + '_'
                + result.filename.substring(result.filename.lastIndexOf('/') + 1,
                                            result.filename.lastIndexOf('.'))
                + '_' + this.annotation.defect;
            this.log.d(`filename:${filename}`);
            this.downloadFileService.results(
                `api/rectangles/compare/${this.annotation.id}/`
                    + `${result.id}/${this.annotation.defect}`,
                filename + '.jpg');
            this.downloadFileService.results(
                `api/rectangles/confusionmatrix/${this.annotation.id}/`
                    + `${result.id}/${this.annotation.defect}`,
                filename + '.csv');
        });
    }
}

@Component({
    selector: 'jhi-compare-dialog',
    templateUrl: 'compare-dialog.html'
})
export class CompareDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<CompareDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: CompareDialogData) {}
}
