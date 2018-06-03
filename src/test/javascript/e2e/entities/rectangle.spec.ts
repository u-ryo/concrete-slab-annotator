import { browser, element, by } from 'protractor';
import { NavBarPage } from './../page-objects/jhi-page-objects';

describe('Rectangle e2e test', () => {

    let navBarPage: NavBarPage;
    let rectangleDialogPage: RectangleDialogPage;
    let rectangleComponentsPage: RectangleComponentsPage;

    beforeAll(() => {
        browser.get('/');
        browser.waitForAngular();
        navBarPage = new NavBarPage();
        navBarPage.getSignInPage().autoSignInUsing('admin', 'admin');
        browser.waitForAngular();
    });

    it('should load Rectangles', () => {
        navBarPage.goToEntity('rectangle');
        rectangleComponentsPage = new RectangleComponentsPage();
        expect(rectangleComponentsPage.getTitle())
            .toMatch(/concreteSlabAnnotatorApp.rectangle.home.title/);

    });

    it('should load create Rectangle dialog', () => {
        rectangleComponentsPage.clickOnCreateButton();
        rectangleDialogPage = new RectangleDialogPage();
        expect(rectangleDialogPage.getModalTitle())
            .toMatch(/concreteSlabAnnotatorApp.rectangle.home.createOrEditLabel/);
        rectangleDialogPage.close();
    });

    it('should create and save Rectangles', () => {
        rectangleComponentsPage.clickOnCreateButton();
        rectangleDialogPage.setXInput('5');
        expect(rectangleDialogPage.getXInput()).toMatch('5');
        rectangleDialogPage.setYInput('5');
        expect(rectangleDialogPage.getYInput()).toMatch('5');
        rectangleDialogPage.setWidthInput('5');
        expect(rectangleDialogPage.getWidthInput()).toMatch('5');
        rectangleDialogPage.setHeightInput('5');
        expect(rectangleDialogPage.getHeightInput()).toMatch('5');
        rectangleDialogPage.setCoordinateXInput('5');
        expect(rectangleDialogPage.getCoordinateXInput()).toMatch('5');
        rectangleDialogPage.setCoordinateYInput('5');
        expect(rectangleDialogPage.getCoordinateYInput()).toMatch('5');
        rectangleDialogPage.getPendingInput().isSelected().then((selected) => {
            if (selected) {
                rectangleDialogPage.getPendingInput().click();
                expect(rectangleDialogPage.getPendingInput().isSelected()).toBeFalsy();
            } else {
                rectangleDialogPage.getPendingInput().click();
                expect(rectangleDialogPage.getPendingInput().isSelected()).toBeTruthy();
            }
        });
        rectangleDialogPage.setCommentInput('comment');
        expect(rectangleDialogPage.getCommentInput()).toMatch('comment');
        rectangleDialogPage.annotationSelectLastOption();
        rectangleDialogPage.save();
        expect(rectangleDialogPage.getSaveButton().isPresent()).toBeFalsy();
    });

    afterAll(() => {
        navBarPage.autoSignOut();
    });
});

export class RectangleComponentsPage {
    createButton = element(by.css('.jh-create-entity'));
    title = element.all(by.css('jhi-rectangle div h2 span')).first();

    clickOnCreateButton() {
        return this.createButton.click();
    }

    getTitle() {
        return this.title.getAttribute('jhiTranslate');
    }
}

export class RectangleDialogPage {
    modalTitle = element(by.css('h4#myRectangleLabel'));
    saveButton = element(by.css('.modal-footer .btn.btn-primary'));
    closeButton = element(by.css('button.close'));
    xInput = element(by.css('input#field_x'));
    yInput = element(by.css('input#field_y'));
    widthInput = element(by.css('input#field_width'));
    heightInput = element(by.css('input#field_height'));
    coordinateXInput = element(by.css('input#field_coordinateX'));
    coordinateYInput = element(by.css('input#field_coordinateY'));
    pendingInput = element(by.css('input#field_pending'));
    commentInput = element(by.css('input#field_comment'));
    annotationSelect = element(by.css('select#field_annotation'));

    getModalTitle() {
        return this.modalTitle.getAttribute('jhiTranslate');
    }

    setXInput = function(x) {
        this.xInput.sendKeys(x);
    };

    getXInput = function() {
        return this.xInput.getAttribute('value');
    };

    setYInput = function(y) {
        this.yInput.sendKeys(y);
    };

    getYInput = function() {
        return this.yInput.getAttribute('value');
    };

    setWidthInput = function(width) {
        this.widthInput.sendKeys(width);
    };

    getWidthInput = function() {
        return this.widthInput.getAttribute('value');
    };

    setHeightInput = function(height) {
        this.heightInput.sendKeys(height);
    };

    getHeightInput = function() {
        return this.heightInput.getAttribute('value');
    };

    setCoordinateXInput = function(coordinateX) {
        this.coordinateXInput.sendKeys(coordinateX);
    };

    getCoordinateXInput = function() {
        return this.coordinateXInput.getAttribute('value');
    };

    setCoordinateYInput = function(coordinateY) {
        this.coordinateYInput.sendKeys(coordinateY);
    };

    getCoordinateYInput = function() {
        return this.coordinateYInput.getAttribute('value');
    };

    getPendingInput = function() {
        return this.pendingInput;
    };
    setCommentInput = function(comment) {
        this.commentInput.sendKeys(comment);
    };

    getCommentInput = function() {
        return this.commentInput.getAttribute('value');
    };

    annotationSelectLastOption = function() {
        this.annotationSelect.all(by.tagName('option')).last().click();
    };

    annotationSelectOption = function(option) {
        this.annotationSelect.sendKeys(option);
    };

    getAnnotationSelect = function() {
        return this.annotationSelect;
    };

    getAnnotationSelectedOption = function() {
        return this.annotationSelect.element(by.css('option:checked')).getText();
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
