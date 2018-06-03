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
