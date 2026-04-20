declare module 'xlsx' {
  export interface WorkBook {
    SheetNames: string[];
    Sheets: Record<string, WorkSheet>;
  }

  export interface WorkSheet {
    [cell: string]: CellObject;
    '!ref'?: string;
    '!merges'?: any[];
  }

  export interface CellObject {
    v: any;
    t: string;
    w?: string;
    f?: string;
  }

  export function readFile(path: string, opts?: any): WorkBook;
  export function writeFile(workbook: WorkBook, path: string): void;

  export const utils: {
    sheet_to_json: (worksheet: WorkSheet, opts?: any) => any[][];
    decode_range: (range: string) => { s: { r: number; c: number }; e: { r: number; c: number } };
    encode_cell: (cell: { r: number; c: number }) => string;
  };
}