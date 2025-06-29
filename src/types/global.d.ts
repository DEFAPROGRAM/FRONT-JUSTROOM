declare module 'jspdf' {
  export default class jsPDF {
    constructor(options?: any)
    addImage(image: HTMLImageElement | string, format: string, x: number, y: number, width: number, height: number): void
    text(text: string, x: number, y: number, options?: any): void
    setFontSize(size: number): void
    setFont(fontName: string, fontStyle?: string): void
    save(filename: string): void
    setPage(pageNumber: number): void
    internal: {
      pageSize: {
        getWidth(): number
        getHeight(): number
      }
      getNumberOfPages(): number
    }
  }
}

declare module 'jspdf-autotable' {
  export default function autoTable(doc: any, options: any): void
}

declare module 'xlsx' {
  export const utils: {
    book_new(): any
    json_to_sheet(data: any[]): any
    sheet_add_aoa(worksheet: any, data: any[][], options?: any): void
    decode_range(range: string): any
    encode_range(range: any): string
    book_append_sheet(workbook: any, worksheet: any, name: string): void
  }
  export function write(workbook: any, options: any): any
} 