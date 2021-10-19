import { Component, OnInit, ViewChild } from '@angular/core';
import { CsvImportService } from '../csv-import.service';
import { CsvData } from '../csv-model';
import * as moment from 'moment';
@Component({
  selector: 'app-csv-import',
  templateUrl: './csv-import.component.html',
  styleUrls: ['./csv-import.component.css'],
})
export class CsvImportComponent implements OnInit {
  public jsondatadisplay: any;
  public records: CsvData[] = [];
  public inValidRecords: CsvData[] = [];
  public ValidRecords: CsvData[] = [];
  public showSuccessMessage: boolean = false;
  @ViewChild('csvReader') csvReader: any;
  constructor(private csvDataService: CsvImportService) {}
  ngOnInit() {}

  uploadListener($event: any): void {
    let files = $event.srcElement.files;
    if (this.isValidCSVFile(files[0])) {
      let input = $event.target;
      let reader = new FileReader();
      reader.readAsText(input.files[0]);
      reader.onload = () => {
        let csvData = reader.result;
        let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);
        let headersRow = this.getHeaderArray(csvRecordsArray);
        this.records = this.getDataRecordsArrayFromCSVFile(
          csvRecordsArray,
          headersRow.length
        );
        this.validateEachRow(this.records);
      };
      reader.onerror = function () {
        console.log('error is occured while reading file!');
      };
    } else {
      alert('Please import valid .csv file.');
      this.fileReset();
    }
  }

  addCoeffiicent(currentRecord: number, end: string) {
    let sellingPrice: number;
    let dueDate = new Date();
    let invoiceSubmitDate = moment(dueDate).format('YYYY-MM-DD');
    var start = moment(invoiceSubmitDate, 'YYYY-MM-DD');
    let diff: number = moment.duration(start.diff(end)).asDays();
    if (diff && diff < 30) {
      sellingPrice = currentRecord * 0.5;
    } else {
      sellingPrice = currentRecord * 0.3;
    }
    return sellingPrice;
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    let csvArr = [];
    for (let i = 1; i < csvRecordsArray.length; i++) {
      let currentRecord = (<string>csvRecordsArray[i]).split(',');
      if (currentRecord.length == headerLength) {
        let csvRecord: CsvData = new CsvData();
        csvRecord.id = currentRecord[0];
        csvRecord.amount = currentRecord[1];
        csvRecord.date = currentRecord[2];
        csvRecord.score = this.addCoeffiicent(
          Number(currentRecord[1]),
          currentRecord[2]
        );
        csvArr.push(csvRecord);
      }
    }
    return csvArr;
  }

  validateEachRow(csvRecord: CsvData[]) {
    this.inValidRecords = [];
    this.ValidRecords = [];
    let regExp = /[a-zA-Z]/g;
    csvRecord.forEach((item: CsvData) => {
      console.log('CSV', moment(item.date, 'YYYY-MM-DD', true).isValid());
      if (
        item.id === ' ' ||
        regExp.test(item.id) ||
        item.amount === ' ' ||
        regExp.test(item.amount) ||
        item.date === ' ' ||
        moment(item.date, 'YYYY-MM-DD', true).isValid() === false
      ) {
        this.inValidRecords.push(item);
      } else {
        this.ValidRecords.push(item);
      }
    });
  }
  isValidCSVFile(file: any) {
    return file.name.endsWith('.csv');
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  fileReset() {
    this.csvReader.nativeElement.value = '';
    this.records = [];
    this.inValidRecords = [];
    this.ValidRecords = [];
    this.jsondatadisplay = '';
    this.showSuccessMessage = false;
  }

  uploadValidRecords() {
    this.csvDataService.postCsvData(this.ValidRecords).subscribe(
      (response) => {
        if (response === 'Success') {
          this.showSuccessMessage = true;
        } else {
          this.showSuccessMessage = false;
        }
      },
      (err) => {
        console.log('Something Bad Happened', err);
      }
    );
  }
}
