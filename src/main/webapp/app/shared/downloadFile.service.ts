import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import 'rxjs/Rx';

// https://stackoverflow.com/questions/40966096/angular-2-download-csv-file-click-event-with-authentication?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
@Injectable()
export class DownloadFileService {
    constructor(public http: HttpClient) {}

    downloadFile(data: any) {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        // http://takasdev.hatenablog.com/entry/2017/06/15/211725
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'accesslog.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
        // window.open(url);
    }

    results(url: string) {
        this.http.get(url, { responseType: 'text' })
            .subscribe(
                (data: string) => this.downloadFile(data),
                (error) => console.log('Error downloading the file.', error),
                () => console.log('OK'));
    }
}
