import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import 'rxjs/Rx';

// https://stackoverflow.com/questions/40966096/angular-2-download-csv-file-click-event-with-authentication?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
@Injectable()
export class DownloadFileService {
    constructor(public http: HttpClient) {}

    downloadFile(data: any, filename: string) {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        // http://takasdev.hatenablog.com/entry/2017/06/15/211725
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        // window.open(url);
    }

    results(url: string, filename: string) {
        // https://angular.io/guide/http#adding-headers
        let headers = new HttpHeaders();
        if (url.indexOf('xml') > 0) {
            headers = new HttpHeaders({
                'Accept': 'application/xml'
            });
        }
        // https://angular.io/guide/http#requesting-non-json-data
        this.http.get(
            url,
            {
                responseType: 'text',
                headers
            })
            .subscribe(
                (data: string) => this.downloadFile(data, filename),
                (error) => console.log('Error downloading the file.', error),
                () => console.log('OK'));
    }
}
