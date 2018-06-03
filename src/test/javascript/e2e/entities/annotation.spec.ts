import { browser, element, by } from 'protractor';
import { NavBarPage } from './../page-objects/jhi-page-objects';

describe('Annotation e2e test', () => {

    let navBarPage: NavBarPage;
    let annotationDialogPage: AnnotationDialogPage;
    let annotationComponentsPage: AnnotationComponentsPage;

    beforeAll(() => {
        browser.get('/');
        browser.waitForAngular();
        navBarPage = new NavBarPage();
        navBarPage.getSignInPage().autoSignInUsing('admin', 'admin');
        browser.waitForAngular();
    });

    it('should load Annotations', () => {
        navBarPage.goToEntity('annotation');
        annotationComponentsPage = new AnnotationComponentsPage();
        expect(annotationComponentsPage.getTitle())
            .toMatch(/concreteSlabAnnotatorApp.annotation.home.title/);

    });

    it('should load create Annotation dialog', () => {
        annotationComponentsPage.clickOnCreateButton();
        annotationDialogPage = new AnnotationDialogPage();
        expect(annotationDialogPage.getModalTitle())
            .toMatch(/concreteSlabAnnotatorApp.annotation.home.createOrEditLabel/);
        annotationDialogPage.close();
    });

    it('should create and save Annotations', () => {
        annotationComponentsPage.clickOnCreateButton();
        annotationDialogPage.setSquareSizeInput('5');
        expect(annotationDialogPage.getSquareSizeInput()).toMatch('5');
        annotationDialogPage.defectSelectLastOption();
        annotationDialogPage.imageSelectLastOption();
        annotationDialogPage.save();
        expect(annotationDialogPage.getSaveButton().isPresent()).toBeFalsy();
    });

    afterAll(() => {
        navBarPage.autoSignOut();
    });
});

export class AnnotationComponentsPage {
    createButton = element(by.css('.jh-create-entity'));
    title = element.all(by.css('jhi-annotation div h2 span')).first();

    clickOnCreateButton() {
        return this.createButton.click();
    }

    getTitle() {
        return this.title.getAttribute('jhiTranslate');
    }
}

export class AnnotationDialogPage {
    modalTitle = element(by.css('h4#myAnnotationLabel'));
    saveButton = element(by.css('.modal-footer .btn.btn-primary'));
    closeButton = element(by.css('button.close'));
    squareSizeInput = element(by.css('input#field_squareSize'));
    defectSelect = element(by.css('select#field_defect'));
    imageSelect = element(by.css('select#field_image'));

    getModalTitle() {
        return this.modalTitle.getAttribute('jhiTranslate');
    }

    setSquareSizeInput = function(squareSize) {
        this.squareSizeInput.sendKeys(squareSize);
    };

    getSquareSizeInput = function() {
        return this.squareSizeInput.getAttribute('value');
    };

    setDefectSelect = function(defect) {
        this.defectSelect.sendKeys(defect);
    };

    getDefectSelect = function() {
        return this.defectSelect.element(by.css('option:checked')).getText();
    };

    defectSelectLastOption = function() {
        this.defectSelect.all(by.tagName('option')).last().click();
    };
    imageSelectLastOption = function() {
        this.imageSelect.all(by.tagName('option')).last().click();
    };

    imageSelectOption = function(option) {
        this.imageSelect.sendKeys(option);
    };

    getImageSelect = function() {
        return this.imageSelect;
    };

    getImageSelectedOption = function() {
        return this.imageSelect.element(by.css('option:checked')).getText();
    };

    save() {
        this.saveButton.click();
    }

    close() {
        this.closeButton.click();
    }

    getSaveButton() {
        return this.saveButton;
    }
}
