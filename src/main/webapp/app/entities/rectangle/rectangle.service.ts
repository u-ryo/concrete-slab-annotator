import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

import { Rectangle } from './rectangle.model';
import { createRequestOption } from '../../shared';

export type EntityResponseType = HttpResponse<Rectangle>;

@Injectable()
export class RectangleService {

    private resourceUrl =  SERVER_API_URL + 'api/rectangles';

    constructor(private http: HttpClient) { }

    create(rectangle: Rectangle): Observable<EntityResponseType> {
        const copy = this.convert(rectangle);
        return this.http.post<Rectangle>(this.resourceUrl, copy, { observe: 'response' })
            .map((res: EntityResponseType) => this.convertResponse(res));
    }

    update(rectangle: Rectangle): Observable<EntityResponseType> {
        const copy = this.convert(rectangle);
        return this.http.put<Rectangle>(this.resourceUrl, copy, { observe: 'response' })
            .map((res: EntityResponseType) => this.convertResponse(res));
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<Rectangle>(`${this.resourceUrl}/${id}`, { observe: 'response'})
            .map((res: EntityResponseType) => this.convertResponse(res));
    }

    query(req?: any): Observable<HttpResponse<Rectangle[]>> {
        const options = createRequestOption(req);
        return this.http.get<Rectangle[]>(this.resourceUrl, { params: options, observe: 'response' })
            .map((res: HttpResponse<Rectangle[]>) => this.convertArrayResponse(res));
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response'});
    }

    queryWithAnnotationId(annotationId: any): Observable<HttpResponse<Map<string, Rectangle>>> {
        return this.http.get<Map<string, Rectangle>>(`${this.resourceUrl}/annotation/${annotationId}`, { observe: 'response' })
            .map((res: HttpResponse<Map<string, Rectangle>>) => this.convertMapResponse(res));
    }

    saveRectangles(annotationId: any, rectangles: any): Observable<HttpResponse<Map<string, Rectangle>>> {
        const copy = Observable.from(rectangles).map((rectangle) => this.convert(rectangle));
        // console.dir(`rectangles:${JSON.stringify(rectangles)}, copy: ${JSON.stringify(copy)}`);
        return this.http.post<Map<string, Rectangle>>(`${this.resourceUrl}/annotation/${annotationId}`, rectangles, { observe: 'response' })
            .map((res: HttpResponse<Map<string, Rectangle>>) => this.convertMapResponse(res));
    }

    private convertResponse(res: EntityResponseType): EntityResponseType {
        const body: Rectangle = this.convertItemFromServer(res.body);
        return res.clone({body});
    }

    private convertArrayResponse(res: HttpResponse<Rectangle[]>): HttpResponse<Rectangle[]> {
        const jsonResponse: Rectangle[] = res.body;
        const body: Rectangle[] = [];
        for (let i = 0; i < jsonResponse.length; i++) {
            body.push(this.convertItemFromServer(jsonResponse[i]));
        }
        return res.clone({body});
    }

    private convertMapResponse(res: HttpResponse<Map<string, Rectangle>>): HttpResponse<Map<string, Rectangle>> {
        const jsonResponse: Map<string, Rectangle> = res.body;
        const body: Map<string, Rectangle> = new Map();
        Object.keys(jsonResponse).forEach((key) => {
            body[key] = this.convertItemFromServer(jsonResponse[key]);
        });
        return res.clone({body});
    }

    /**
     * Convert a returned JSON object to Rectangle.
     */
    private convertItemFromServer(rectangle: Rectangle): Rectangle {
        const copy: Rectangle = Object.assign({}, rectangle);
        return copy;
    }

    /**
     * Convert a Rectangle to a JSON which can be sent to the server.
     */
    private convert(rectangle: Rectangle): Rectangle {
        const copy: Rectangle = Object.assign({}, rectangle);
        return copy;
    }
}
