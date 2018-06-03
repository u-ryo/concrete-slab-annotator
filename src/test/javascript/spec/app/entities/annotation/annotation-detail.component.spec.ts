/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ConcreteSlabAnnotatorTestModule } from '../../../test.module';
import { AnnotationDetailComponent } from '../../../../../../main/webapp/app/entities/annotation/annotation-detail.component';
import { AnnotationService } from '../../../../../../main/webapp/app/entities/annotation/annotation.service';
import { Annotation } from '../../../../../../main/webapp/app/entities/annotation/annotation.model';

describe('Component Tests', () => {

    describe('Annotation Management Detail Component', () => {
        let comp: AnnotationDetailComponent;
        let fixture: ComponentFixture<AnnotationDetailComponent>;
        let service: AnnotationService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [ConcreteSlabAnnotatorTestModule],
                declarations: [AnnotationDetailComponent],
                providers: [
                    AnnotationService
                ]
            })
            .overrideTemplate(AnnotationDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(AnnotationDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(AnnotationService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new HttpResponse({
                    body: new Annotation(123)
                })));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.annotation).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
