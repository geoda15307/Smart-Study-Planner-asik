import * as XLSX from "xlsx";
import type { DocumentProcessor } from "../types";

export const spreadsheetProcessor: DocumentProcessor = {
  category: "spreadsheet",
  name: "spreadsheet",
  async process(blob) {
    let workbook: XLSX.WorkBook;
    try {
      const arrayBuffer = await blob.arrayBuffer();
      workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
    } catch (error) {
      return {
        status: "failed",
        errorCode: "PARSE_ERROR",
        errorMessage: error instanceof Error ? error.message : "Gagal membaca file spreadsheet."
      };
    }

    const sheetNames = workbook.SheetNames;
    if (sheetNames.length === 0) {
      return {
        status: "failed",
        errorCode: "EMPTY_RESULT",
        errorMessage: "Spreadsheet tidak memiliki sheet apa pun."
      };
    }

    const sheetCsvs = sheetNames.map((name) => XLSX.utils.sheet_to_csv(workbook.Sheets[name]).trim());
    const hasContent = sheetCsvs.some((csv) => csv.length > 0);

    if (!hasContent) {
      return {
        status: "failed",
        errorCode: "EMPTY_RESULT",
        errorMessage: "Spreadsheet tidak memiliki data."
      };
    }

    const text = sheetNames.map((name, index) => `--- ${name} ---\n${sheetCsvs[index]}`).join("\n\n").trim();

    return {
      status: "extracted",
      rawText: text,
      sheetNames
    };
  }
};
