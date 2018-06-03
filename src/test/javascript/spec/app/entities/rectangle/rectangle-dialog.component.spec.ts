/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { ConcreteSlabAnnotatorTestModule } from '../../../test.module';
import { RectangleDialogComponent } from '../../../../../../main/webapp/app/entities/rectangle/rectangle-dialog.component';
import { RectangleService } from '../../../../../../main/webapp/app/entities/rectangle/rectangle.service';
import { Rectangle } from '../../../../../../main/webapp/app/entities/rectangle/rectangle.model';
import { AnnotationService } from '../../../../../../main/webapp/app/entities/annotation';

describe('Component Tests', () => {

    describe('Rectangle Management Dialog Component', () => {
        let comp: RectangleDialogComponent;
        let fixture: ComponentFixture<RectangleDialogComponent>;
        let service: RectangleService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [ConcreteSlabAnnotatorTestModule],
                declarations: [RectangleDialogComponent],
                providers: [
                    AnnotationService,
                    RectangleService
                ]
            })
            .overrideTemplate(RectangleDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(RectangleDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(RectangleService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('save', () => {
            it('Should call update service on save for existing entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new Rectangle(123);
                        spyOn(service, 'update').and.returnValue(Observable.of(new HttpResponse({body: entity})));
                        comp.rectangle = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.update).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'rectangleListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );

            it('Should call create service on save for new entity',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        const entity = new Rectangle();
                        spyOn(service, 'create').and.returnValue(Observable.of(new HttpResponse({body: entity})));
                        comp.rectangle = entity;
                        // WHEN
                        comp.save();
                        tick(); // simulate async

                        // THEN
                        expect(service.create).toHaveBeenCalledWith(entity);
                        expect(comp.isSaving).toEqual(false);
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalledWith({ name: 'rectangleListModification', content: 'OK'});
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
