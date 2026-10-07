import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToCsv(data: any[], fileName: string = 'telemetry_data'): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    this.downloadFile(csvOutput, `${fileName}.csv`, 'text/csv;charset=utf-8;');
  }

  exportToExcel(data: any[], fileName: string = 'telemetry_data'): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Telemetry Logs');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

  private downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}