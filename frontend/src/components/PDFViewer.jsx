import { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import DraggableSignature from './DraggableSignature';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import styles (standard React-PDF requirements)
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = ({ fileUrl, showSignature, signatureText, signatureStyle, signatureImage, onPositionChange }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);   // 1-based for react-pdf
  const [pageWidth, setPageWidth] = useState(null);
  const [pageHeight, setPageHeight] = useState(null);
  const [signaturePos, setSignaturePos] = useState(null);

  // Fixed viewer width for consistency
  const VIEWER_WIDTH = 700;

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setCurrentPage(1); // reset to page 1 whenever a new doc loads
  }

  function onPageLoadSuccess(page) {
    const viewport = page.getViewport({ scale: 1 });
    const scale = VIEWER_WIDTH / viewport.width;
    const renderedHeight = viewport.height * scale;
    setPageWidth(VIEWER_WIDTH);
    setPageHeight(renderedHeight);
  }

  const goToPrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(numPages || 1, p + 1));
  }, [numPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') goToPrevPage();
      if (e.key === 'ArrowRight') goToNextPage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goToPrevPage, goToNextPage]);

  const handlePositionChange = (pos) => {
    setSignaturePos(pos);
    if (onPositionChange && pageWidth && pageHeight) {
      onPositionChange({
        x: pos.x,
        y: pos.y,
        page: currentPage - 1,   // convert to 0-based index for backend
        viewerWidth: pageWidth,
        viewerHeight: pageHeight,
      });
    }
  };

  return (
    <div className="pdf-viewer-container flex flex-col items-center">
      {/* Controls / Info bar */}
      <div className="w-full max-w-[700px] mb-4 flex items-center justify-between bg-gray-100 p-3 rounded-lg">
        <div className="text-sm font-medium text-gray-700">
          PDF Preview {numPages && `(${currentPage} of ${numPages})`}
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous page (←)"
          >
            <ChevronLeft className="h-4 w-4 text-gray-700" />
          </button>
          <span className="text-sm text-gray-600 min-w-[70px] text-center">
            Page {currentPage}{numPages ? ` / ${numPages}` : ''}
          </span>
          <button
            onClick={goToNextPage}
            disabled={!numPages || currentPage >= numPages}
            className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next page (→)"
          >
            <ChevronRight className="h-4 w-4 text-gray-700" />
          </button>
        </div>

        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Open in New Tab
        </a>
      </div>

      {/* PDF Document Container */}
      <div className="relative border-2 border-gray-300 shadow-lg bg-gray-500">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="h-[500px] w-[700px] flex items-center justify-center bg-gray-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          }
          error={
            <div className="h-[200px] w-[700px] flex items-center justify-center bg-red-50 text-red-600">
              Failed to load PDF
            </div>
          }
        >
          {/* Wrap Page in a relative div to be the container for DraggableSignature */}
          <div className="relative" style={{ width: VIEWER_WIDTH }}>
            <Page
              key={currentPage}
              pageNumber={currentPage}
              width={VIEWER_WIDTH}
              onLoadSuccess={onPageLoadSuccess}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />

            {/* Draggable Overlay */}
            {showSignature && ((signatureText && signatureStyle) || signatureImage) && pageWidth && (
              <DraggableSignature
                key={currentPage}   // reset position when page changes
                signatureText={signatureText}
                signatureStyle={signatureStyle}
                signatureImage={signatureImage}
                onPositionChange={handlePositionChange}
              />
            )}
          </div>
        </Document>
      </div>

      {/* Instructions */}
      {showSignature ? (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-[700px] w-full">
          <p className="text-sm text-blue-900 font-medium mb-2">
            📍 Position Your Signature — Page {currentPage}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Navigate pages</strong> using the arrows above, then <strong>drag the signature box</strong> to where you want it placed.
            {signaturePos && ` (X=${signaturePos.x}, Y=${signaturePos.y})`}
          </p>
        </div>
      ) : (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg max-w-[700px] w-full">
          <p className="text-sm text-gray-600">
            Document mode: Read Only / Signed
          </p>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;

