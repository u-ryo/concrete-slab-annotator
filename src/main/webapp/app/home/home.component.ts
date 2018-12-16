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

    downloadAllXml() {
        const f = 'annotations.zip';
        this.log.i(`filename:${f}`);
        this.downloadFileService.results(
            `api/rectangles/xml/${this.annotation.squareSize}/all`, f);
    }

    openCompareDialog() {
        const dialogRef = this.dialog.open(
            CompareDialogComponent, {
                disableClose: true,
                width: '90%',
                data: {
                    from: this.filename,
                    images: this.images,
                    to: this.filename
                }});

        dialogRef.afterClosed().subscribe((result) => {
            this.log.d(`result:${result}`);
            const filename =
                this.filename.substring(this.filename.lastIndexOf('/') + 1,
                                        this.filename.lastIndexOf('.'))
                + '_'
                + result.substring(result.lastIndexOf('/') + 1,
                                   result.lastIndexOf('.'))
                + '_' + this.annotation.defect;
            this.log.d(`filename:${filename}`);
            const id = (this.images.filter((i) => i.filename === result))[0].id;
            this.log.d(`id:${id}`);
            if (result) {
                this.downloadFileService.results(
                    `api/rectangles/compare/${this.annotation.id}/`
                        + `${id}/${this.annotation.defect}`,
                    filename + '.jpg');
                this.downloadFileService.results(
                    `api/rectangles/confusionmatrix/${this.annotation.id}/`
                        + `${id}/${this.annotation.defect}`,
                    filename + '.csv');
            } else {
                this.log.er(`result is null for ${filename}`);
            }
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
