/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { ConcreteSlabAnnotatorTestModule } from '../../../test.module';
import { RectangleComponent } from '../../../../../../main/webapp/app/entities/rectangle/rectangle.component';
import { RectangleService } from '../../../../../../main/webapp/app/entities/rectangle/rectangle.service';
import { Rectangle } from '../../../../../../main/webapp/app/entities/rectangle/rectangle.model';

describe('Component Tests', () => {

    describe('Rectangle Management Component', () => {
        let comp: RectangleComponent;
        let fixture: ComponentFixture<RectangleComponent>;
        let service: RectangleService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [ConcreteSlabAnnotatorTestModule],
                declarations: [RectangleComponent],
                providers: [
                    RectangleService
                ]
            })
            .overrideTemplate(RectangleComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(RectangleComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(RectangleService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN
                const headers = new HttpHeaders().append('link', 'link;link');
                spyOn(service, 'query').and.returnValue(Observable.of(new HttpResponse({
                    body: [new Rectangle(123)],
                    headers
                })));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.query).toHaveBeenCalled();
                expect(comp.rectangles[0]).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
