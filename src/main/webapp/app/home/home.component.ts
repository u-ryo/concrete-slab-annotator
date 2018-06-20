import { Component, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';
import { JhiLanguageService } from 'ng-jhipster';
import { LoginService } from '../shared';
import { SharedStorage } from 'ngx-store';
import { Router } from '@angular/router';
import { Annotation } from '../entities/annotation/annotation.model';

import { Account, LoginModalService, Principal } from '../shared';
import { DownloadFileService } from '../shared/downloadFile.service';

@Component({
    selector: 'jhi-home',
    templateUrl: './home.component.html',
    styleUrls: [
        'home.css'
    ]
})
export class HomeComponent implements OnInit {
    account: Account;
    modalRef: NgbModalRef;
    language = 'en';
    @SharedStorage() filename: string;
    @SharedStorage() annotation: Annotation;

    constructor(
        private downloadFileService: DownloadFileService,
        private principal: Principal,
        private languageService: JhiLanguageService,
        private loginModalService: LoginModalService,
        private eventManager: JhiEventManager,
        private loginService: LoginService,
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

    downloadXml() {
        console.log(`filename:${this.filename}`);
        const f = this.filename.substring(this.filename.lastIndexOf('/') + 1);
        this.downloadFileService.results(
            `api/rectangles/xml/annotation/${this.annotation.id}`,
            `${f}.${this.annotation.defect}.${this.annotation.squareSize}.xml`);
    }
}
