/* tslint:disable max-line-length */
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ConcreteSlabAnnotatorTestModule } from '../../../test.module';
import { RectangleDetailComponent } from '../../../../../../main/webapp/app/entities/rectangle/rectangle-detail.component';
import { RectangleService } from '../../../../../../main/webapp/app/entities/rectangle/rectangle.service';
import { Rectangle } from '../../../../../../main/webapp/app/entities/rectangle/rectangle.model';

describe('Component Tests', () => {

    describe('Rectangle Management Detail Component', () => {
        let comp: RectangleDetailComponent;
        let fixture: ComponentFixture<RectangleDetailComponent>;
        let service: RectangleService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [ConcreteSlabAnnotatorTestModule],
                declarations: [RectangleDetailComponent],
                providers: [
                    RectangleService
                ]
            })
            .overrideTemplate(RectangleDetailComponent, '')
            .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(RectangleDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(RectangleService);
        });

        describe('OnInit', () => {
            it('Should call load all on init', () => {
                // GIVEN

                spyOn(service, 'find').and.returnValue(Observable.of(new HttpResponse({
                    body: new Rectangle(123)
                })));

                // WHEN
                comp.ngOnInit();

                // THEN
                expect(service.find).toHaveBeenCalledWith(123);
                expect(comp.rectangle).toEqual(jasmine.objectContaining({id: 123}));
            });
        });
    });

});
