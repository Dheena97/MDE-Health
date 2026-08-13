/**
 * Unified file parser for XLSX and CSV files.
 * Uses SheetJS for XLSX and PapaParse for CSV.
 */
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ParseResult {
  headers: string[];
  rows: Record<string, unknown>[];
  error?: string;
}

/**
 * Parse a file (XLSX or CSV) and return headers + rows.
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'xlsx' || extension === 'xls') {
    return parseXlsx(file);
  } else if (extension === 'csv') {
    return parseCsv(file);
  } else {
    return { headers: [], rows: [], error: `Unsupported file format: .${extension}. Please upload .xlsx or .csv` };
  }
}

async function parseXlsx(file: File): Promise<ParseResult> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

    // Use the first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { headers: [], rows: [], error: 'No sheets found in the workbook.' };
    }

    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (jsonData.length === 0) {
      return { headers: [], rows: [], error: 'The sheet is empty.' };
    }

    const headers = Object.keys(jsonData[0] as Record<string, unknown>);
    const rows = jsonData as Record<string, unknown>[];

    return { headers, rows };
  } catch (err) {
    return {
      headers: [],
      rows: [],
      error: `Failed to parse XLSX: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

function parseCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep all values as strings for consistent handling
      complete: (results) => {
        if (results.errors.length > 0) {
          const criticalErrors = results.errors.filter(e => e.type === 'Delimiter' || e.type === 'FieldMismatch');
          if (criticalErrors.length > 0) {
            resolve({
              headers: [],
              rows: [],
              error: `CSV parsing errors: ${criticalErrors.map(e => e.message).join('; ')}`,
            });
            return;
          }
        }

        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, unknown>[];

        resolve({ headers, rows });
      },
      error: (err) => {
        resolve({
          headers: [],
          rows: [],
          error: `Failed to parse CSV: ${err.message}`,
        });
      },
    });
  });
}
