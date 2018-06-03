/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { ConcreteSlabAnnotatorTestModule } from '../../../test.module';
import { AnnotationComponent } from '../../../../../../main/webapp/app/entities/annotation/annotation.component';
import { AnnotationService } from '../../../../../../main/webapp/app/entities/annotation/annotation.service';
import { Annotation } from '../../../../../../main/webapp/app/entities/annotation/annotation.model';

describe('Component Tests', () => {

    describe('Annotation Management Component', () => {
        let comp: AnnotationComponent;
        let fixture: ComponentFixture<AnnotationComponent>;
        let service: AnnotationService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [ConcreteSlabAnnotatorTestModule],
                declarations: [AnnotationComponent],
                providers: [
                    AnnotationService
                ]
            })
            .overrideTemplate(AnnotationComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(AnnotationComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(AnnotationService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new HttpHeaders().append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(Observable.of(new HttpResponse({
                    body: [new Annotation(123)],
                    headers
                })));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                expect(comp.annotations[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
