/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { ConcreteSlabAnnotatorTestModule } from '../../../test.module';
import { RectangleDeleteDialogComponent } from '../../../../../../main/webapp/app/entities/rectangle/rectangle-delete-dialog.component';
import { RectangleService } from '../../../../../../main/webapp/app/entities/rectangle/rectangle.service';

describe('Component Tests', () => {

    describe('Rectangle Management Delete Component', () => {
        let comp: RectangleDeleteDialogComponent;
        let fixture: ComponentFixture<RectangleDeleteDialogComponent>;
        let service: RectangleService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [ConcreteSlabAnnotatorTestModule],
                declarations: [RectangleDeleteDialogComponent],
                providers: [
                    RectangleService
                ]
            })
            .overrideTemplate(RectangleDeleteDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(RectangleDeleteDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(RectangleService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('confirmDelete', () => {
            it('Should call delete service on confirmDelete',
                inject([],
                    fakeAsync(() => {
                        // GIVEN
                        spyOn(service, 'delete').and.returnValue(Observable.of({}));

                        // WHEN
                        comp.confirmDelete(123);
                        tick();

                        // THEN
                        expect(service.delete).toHaveBeenCalledWith(123);
                        expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                        expect(mockEventManager.broadcastSpy).toHaveBeenCalled();
                    })
                )
            );
        });
    });

});
