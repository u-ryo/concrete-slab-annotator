import { browser, element, by } from 'protractor';
import { NavBarPage } from './../page-objects/jhi-page-objects';

describe('Image e2e test', () => {

    let navBarPage: NavBarPage;
    let imageDialogPage: ImageDialogPage;
    let imageComponentsPage: ImageComponentsPage;

    beforeAll(() => {
        browser.get('/');
        browser.waitForAngular();
        navBarPage = new NavBarPage();
        navBarPage.getSignInPage().autoSignInUsing('admin', 'admin');
        browser.waitForAngular();
    });

    it('should load Images', () => {
        navBarPage.goToEntity('image');
        imageComponentsPage = new ImageComponentsPage();
        expect(imageComponentsPage.getTitle())
            .toMatch(/concreteSlabAnnotatorApp.image.home.title/);

    });

    it('should load create Image dialog', () => {
        imageComponentsPage.clickOnCreateButton();
        imageDialogPage = new ImageDialogPage();
        expect(imageDialogPage.getModalTitle())
            .toMatch(/concreteSlabAnnotatorApp.image.home.createOrEditLabel/);
        imageDialogPage.close();
    });

    it('should create and save Images', () => {
        imageComponentsPage.clickOnCreateButton();
        imageDialogPage.setFilenameInput('filename');
        expect(imageDialogPage.getFilenameInput()).toMatch('filename');
        imageDialogPage.setWidthInput('5');
        expect(imageDialogPage.getWidthInput()).toMatch('5');
        imageDialogPage.setHeightInput('5');
        expect(imageDialogPage.getHeightInput()).toMatch('5');
        imageDialogPage.setFocalLengthInput('5');
        expect(imageDialogPage.getFocalLengthInput()).toMatch('5');
        imageDialogPage.setDistanceInput('5');
        expect(imageDialogPage.getDistanceInput()).toMatch('5');
        imageDialogPage.cameraSelectLastOption();
        imageDialogPage.setRoleInput('role');
        expect(imageDialogPage.getRoleInput()).toMatch('role');
        imageDialogPage.save();
        expect(imageDialogPage.getSaveButton().isPresent()).toBeFalsy();
    });

    afterAll(() => {
        navBarPage.autoSignOut();
    });
});

export class ImageComponentsPage {
    createButton = element(by.css('.jh-create-entity'));
    title = element.all(by.css('jhi-image div h2 span')).first();

    clickOnCreateButton() {
        return this.createButton.click();
    }

    getTitle() {
        return this.title.getAttribute('jhiTranslate');
    }
}

export class ImageDialogPage {
    modalTitle = element(by.css('h4#myImageLabel'));
    saveButton = element(by.css('.modal-footer .btn.btn-primary'));
    closeButton = element(by.css('button.close'));
    filenameInput = element(by.css('input#field_filename'));
    widthInput = element(by.css('input#field_width'));
    heightInput = element(by.css('input#field_height'));
    focalLengthInput = element(by.css('input#field_focalLength'));
    distanceInput = element(by.css('input#field_distance'));
    cameraSelect = element(by.css('select#field_camera'));
    roleInput = element(by.css('input#field_role'));

    getModalTitle() {
        return this.modalTitle.getAttribute('jhiTranslate');
    }

    setFilenameInput = function(filename) {
        this.filenameInput.sendKeys(filename);
    };

    getFilenameInput = function() {
        return this.filenameInput.getAttribute('value');
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

    setFocalLengthInput = function(focalLength) {
        this.focalLengthInput.sendKeys(focalLength);
    };

    getFocalLengthInput = function() {
        return this.focalLengthInput.getAttribute('value');
    };

    setDistanceInput = function(distance) {
        this.distanceInput.sendKeys(distance);
    };

    getDistanceInput = function() {
        return this.distanceInput.getAttribute('value');
    };

    setCameraSelect = function(camera) {
        this.cameraSelect.sendKeys(camera);
    };

    getCameraSelect = function() {
        return this.cameraSelect.element(by.css('option:checked')).getText();
    };

    cameraSelectLastOption = function() {
        this.cameraSelect.all(by.tagName('option')).last().click();
    };
    setRoleInput = function(role) {
        this.roleInput.sendKeys(role);
    };

    getRoleInput = function() {
        return this.roleInput.getAttribute('value');
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
