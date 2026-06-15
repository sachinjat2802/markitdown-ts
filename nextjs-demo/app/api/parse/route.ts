import { NextResponse } from 'next/server';
import { MarkItDown } from 'markitdown-ts';
import path from 'path';

// In-memory ArrayBuffer parser
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Explicitly define the accepted native types
    const supportedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'text/html', // html
      'text/csv', // csv
      'application/json', // json
      'application/zip', // zip
      'application/pdf', // pdf
      'text/plain', // txt
      'application/vnd.ms-excel', // xls
      'application/msword', // doc
    ];

    if (!supportedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Supported types: DOCX, PPTX, XLSX, HTML, CSV, JSON, ZIP, PDF, TXT' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const markitdown = new MarkItDown();
    const fileExtension = path.extname(file.name);

    // Use the document format natively without LLMs
    const result = await markitdown.convertBuffer(buffer, {
      file_extension: fileExtension,
    });

    // Output Sanitization: remove <br> and <br/>
    const rawMarkdown = result?.markdown || '';
    const sanitizedMarkdown = rawMarkdown.replace(/<br\s*\/?>/gi, '');

    return NextResponse.json({ markdown: sanitizedMarkdown });
  } catch (error) {
    console.error('Error parsing file:', error);
    return NextResponse.json({ error: 'Failed to parse file' }, { status: 500 });
  }
}
