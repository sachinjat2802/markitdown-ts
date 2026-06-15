'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const supportedTypes = [
    '.docx',
    '.pptx',
    '.xlsx',
    '.html',
    '.csv',
    '.json',
    '.zip',
    '.pdf',
    '.txt',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setMarkdown('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse file');
      }

      const data = await response.json();
      setMarkdown(data.markdown);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col h-[90vh]">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">MarkItDown Parser</h1>
          <p className="text-blue-100">Convert documents to Markdown locally without LLMs</p>
        </div>

        <div className="p-6 flex-grow flex flex-col">
          <form onSubmit={handleSubmit} className="mb-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <input
                id="fileInput"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={supportedTypes.join(',')}
              />
              {file ? (
                <div>
                  <p className="text-lg font-semibold text-blue-700">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg text-gray-600 mb-2">Drag & drop a file here, or click to select</p>
                  <p className="text-sm text-gray-500">
                    Supported formats: {supportedTypes.join(', ')}
                  </p>
                </div>
              )}
            </div>

            {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">{error}</div>}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={!file || isLoading}
                className={`px-6 py-2 rounded font-semibold text-white transition-colors ${
                  !file || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Parsing...
                  </span>
                ) : (
                  'Parse Document'
                )}
              </button>
            </div>
          </form>

          <div className="flex-grow flex flex-col min-h-0">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Output (Markdown)</h2>
            <textarea
              readOnly
              value={markdown}
              className="flex-grow w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm bg-gray-50"
              placeholder="Parsed markdown will appear here..."
            />
          </div>
        </div>
      </div>
    </main>
  );
}
