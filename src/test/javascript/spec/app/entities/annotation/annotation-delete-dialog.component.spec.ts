/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { JhiEventManager } from 'ng-jhipster';

import { ConcreteSlabAnnotatorTestModule } from '../../../test.module';
import { AnnotationDeleteDialogComponent } from '../../../../../../main/webapp/app/entities/annotation/annotation-delete-dialog.component';
import { AnnotationService } from '../../../../../../main/webapp/app/entities/annotation/annotation.service';

describe('Component Tests', () => {

    describe('Annotation Management Delete Component', () => {
        let comp: AnnotationDeleteDialogComponent;
        let fixture: ComponentFixture<AnnotationDeleteDialogComponent>;
        let service: AnnotationService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [ConcreteSlabAnnotatorTestModule],
                declarations: [AnnotationDeleteDialogComponent],
                providers: [
                    AnnotationService
                ]
            })
            .overrideTemplate(AnnotationDeleteDialogComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(AnnotationDeleteDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(AnnotationService);
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
