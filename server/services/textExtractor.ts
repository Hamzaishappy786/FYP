import fs from "fs";

export async function extractTextFromPDF(filePath: string): Promise<{
  success: boolean;
  text?: string;
  pageCount?: number;
  error?: string;
}> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    return {
      success: true,
      text: data.text,
      pageCount: data.numpages,
    };
  } catch (error) {
    return {
      success: false,
      error: `PDF extraction failed: ${error}`,
    };
  }
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    
    if (start + overlap >= text.length) break;
  }
  
  return chunks;
}

export function cleanMedicalText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/[^\w\s.,;:()[\]{}<>+\-*/=%@#$&|^~`'"!?\n]/g, " ")
    .trim();
}
