import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CsvImportService {
  constructor(private httpClient: HttpClient) {}
  public postCsvData(jsonData: any[]): Observable<string> {
    let url = `http://localhost:3000`;
    return this.httpClient.post(url, jsonData, {
      responseType: 'text',
    });
  }
}
