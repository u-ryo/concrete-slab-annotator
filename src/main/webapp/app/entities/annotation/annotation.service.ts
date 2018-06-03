import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SERVER_API_URL } from '../../app.constants';

import { Annotation } from './annotation.model';
import { createRequestOption } from '../../shared';

export type EntityResponseType = HttpResponse<Annotation>;

@Injectable()
export class AnnotationService {

    private resourceUrl =  SERVER_API_URL + 'api/annotations';

    constructor(private http: HttpClient) { }

    create(annotation: Annotation): Observable<EntityResponseType> {
        const copy = this.convert(annotation);
        return this.http.post<Annotation>(this.resourceUrl, copy, { observe: 'response' })
            .map((res: EntityResponseType) => this.convertResponse(res));
    }

    update(annotation: Annotation): Observable<EntityResponseType> {
        const copy = this.convert(annotation);
        return this.http.put<Annotation>(this.resourceUrl, copy, { observe: 'response' })
            .map((res: EntityResponseType) => this.convertResponse(res));
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http.get<Annotation>(`${this.resourceUrl}/${id}`, { observe: 'response'})
            .map((res: EntityResponseType) => this.convertResponse(res));
    }

    query(req?: any): Observable<HttpResponse<Annotation[]>> {
        const options = createRequestOption(req);
        return this.http.get<Annotation[]>(this.resourceUrl, { params: options, observe: 'response' })
            .map((res: HttpResponse<Annotation[]>) => this.convertArrayResponse(res));
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response'});
    }

    private convertResponse(res: EntityResponseType): EntityResponseType {
        const body: Annotation = this.convertItemFromServer(res.body);
        return res.clone({body});
    }

    private convertArrayResponse(res: HttpResponse<Annotation[]>): HttpResponse<Annotation[]> {
        const jsonResponse: Annotation[] = res.body;
        const body: Annotation[] = [];
        for (let i = 0; i < jsonResponse.length; i++) {
            body.push(this.convertItemFromServer(jsonResponse[i]));
        }
        return res.clone({body});
    }

    /**
     * Convert a returned JSON object to Annotation.
     */
    private convertItemFromServer(annotation: Annotation): Annotation {
        const copy: Annotation = Object.assign({}, annotation);
        return copy;
    }

    /**
     * Convert a Annotation to a JSON which can be sent to the server.
     */
    private convert(annotation: Annotation): Annotation {
        const copy: Annotation = Object.assign({}, annotation);
        return copy;
    }
}
