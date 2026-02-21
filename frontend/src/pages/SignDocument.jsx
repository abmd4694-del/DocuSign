import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Edit3, Type, Pen, CheckCircle, Download } from 'lucide-react';
import PDFViewer from '../components/PDFViewer';
import SignatureCanvas from '../components/SignatureCanvas';
import SignatureStyleSelector from '../components/SignatureStyleSelector';

const SignDocument = () => {
  const { token } = useParams();
  const [document, setDocument] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const [error, setError] = useState(null);

  // Determine API base URL dynamically
  const API_BASE_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : `${window.location.protocol}//${window.location.hostname}:5000`;

  // Signature state
  const [signatureTab, setSignatureTab] = useState('type');
  const [signatureName, setSignatureName] = useState('');
  const [signatureData, setSignatureData] = useState({
    signatureImage: null,
    x: 100,
    y: 700,
    page: 0,
    viewerWidth: 707, // Default A4 width
    viewerHeight: 1000,
  });
  const [selectedSignatureStyle, setSelectedSignatureStyle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/docs/sign/${token}`);
        if (response.data.success) {
          setDocument(response.data.data);
          setRecipient(response.data.recipient);
          setSignatureName(response.data.recipient.name); // Pre-fill name
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError(err.response?.data?.message || 'Invalid or expired link');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [token, API_BASE_URL]);

  const handleDrawnSignature = (dataUrl) => {
    setSignatureData({ ...signatureData, signatureImage: dataUrl });
  };

  const handleStyleSelect = (style) => {
    setSelectedSignatureStyle(style);
  };

  // Convert text signature to image to preserve font style
  const generateSignatureImage = (text, style) => {
    const canvas = window.document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800; // Updated resolution
    canvas.height = 200;

    // White background (needed for JPEG — no transparency)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const fontSize = 96; // Updated font size
    const fontFamily = style.style.fontFamily.replace(/'/g, '');
    const fontStyle = style.style.fontStyle || 'normal';
    const fontWeight = style.style.fontWeight || 'normal';

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Use JPEG for much smaller payload size
    return canvas.toDataURL('image/jpeg', 0.7);
  };

  const handleSign = async () => {
    if (!document) return;

    let finalSignatureImage = signatureData.signatureImage;

    // If typing, generate image from text
    if (signatureTab === 'type') {
      if (!signatureName || !selectedSignatureStyle) {
        toast.error('Please enter name and select a style');
        return;
      }
      finalSignatureImage = generateSignatureImage(signatureName, selectedSignatureStyle);
    }

    const signaturePayload = {
      documentId: document._id,
      token: token, // Important: Send token for auth
      signatureText: signatureName || '', // Send name as fallback record
      signatureImage: finalSignatureImage, // Always send as image
      x: signatureData.x,
      y: signatureData.y,
      page: signatureData.page,
      viewerWidth: signatureData.viewerWidth,
      viewerHeight: signatureData.viewerHeight,
    };

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/signatures/finalize-public`, signaturePayload);
      
      if (response.data.success) {
        toast.success('Document signed successfully!');
        setSuccess(true);
        // Update local document state to show signed status
        setDocument(response.data.data.document);
      }
    } catch (err) {
      console.error('Signing error:', err);
      toast.error(err.response?.data?.message || 'Failed to sign document');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link Expired or Invalid</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Please contact the sender for a new link.</p>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    try {
      setIsDownloading(true);
      // Use the dedicated download endpoint which handles CORS and headers correctly
      const downloadUrl = `${API_BASE_URL}/api/docs/${document._id}/download`;
      
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', ''); // Browser matches filename from Content-Disposition
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      
      // We can't easily know when a direct link download finishes, so we reset state after a short delay
      setTimeout(() => setIsDownloading(false), 2000);
    } catch (e) {
      console.error('Download trigger error:', e);
      toast.error('Failed to download document');
      setIsDownloading(false);
    }
  };

  if (success) {
    const pdfUrl = `${API_BASE_URL}/${document.filePath.replace(/\\/g, '/')}?t=${Date.now()}`;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You've Signed!</h2>
          <p className="text-gray-600 mb-6">
            Thank you, <strong>{recipient.name}</strong>. The document has been successfully signed.
          </p>
          
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
          >
            {isDownloading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Download className="w-5 h-5" />
            )}
            {isDownloading ? 'Downloading...' : 'Download Signed PDF'}
          </button>
        </div>
      </div>
    );
  }

  const pdfUrl = `${API_BASE_URL}/${document.filePath.replace(/\\/g, '/')}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{document.originalName}</h1>
          <p className="text-sm text-gray-500">Requested by {document.ownerId?.name || 'Sender'} • Signing as <span className="font-medium text-gray-900">{recipient.name}</span></p>
        </div>
        <div className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
          Guest Signing Mode
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer (Left) */}
        <div className="flex-1 bg-gray-100 overflow-y-auto p-6 flex justify-center">
          <div className="max-w-4xl w-full">
            <PDFViewer
              fileUrl={pdfUrl}
              showSignature={true} // Always show signature overlay for signer
              signatureText={signatureTab === 'type' ? signatureName : ''}
              signatureStyle={selectedSignatureStyle}
              signatureImage={signatureData.signatureImage}
              onPositionChange={(pos) =>
                setSignatureData((prev) => ({ ...prev, x: pos.x, y: pos.y, page: pos.page ?? prev.page, viewerWidth: pos.viewerWidth || prev.viewerWidth, viewerHeight: pos.viewerHeight || prev.viewerHeight }))
              }
            />
          </div>
        </div>

        {/* Controls (Right) */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-y-auto z-10 shadow-xl">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Your Signature</h2>
              
              {/* Tab Switcher */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-4">
                <button
                  onClick={() => setSignatureTab('type')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                    signatureTab === 'type' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Type className="w-4 h-4" /> Type
                </button>
                <button
                  onClick={() => setSignatureTab('draw')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                    signatureTab === 'draw' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Pen className="w-4 h-4" /> Draw
                </button>
              </div>

              {/* Type Signature */}
              {signatureTab === 'type' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  {signatureName && (
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <p className="text-xs text-gray-500 mb-2">Select Style:</p>
                      <SignatureStyleSelector
                        name={signatureName}
                        onSelectStyle={handleStyleSelect}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Draw Signature */}
              {signatureTab === 'draw' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Draw Here</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
                    <SignatureCanvas
                      onSave={handleDrawnSignature}
                      onClear={() => setSignatureData({ ...signatureData, signatureImage: null })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
               👇 <strong>Step 1:</strong> Drag the signature box on the PDF to position it.
               <br/>
               ✍️ <strong>Step 2:</strong> Click the button below to finish.
            </div>

            <button
              onClick={handleSign}
              disabled={
                isSubmitting ||
                (signatureTab === 'type' && (!signatureName || !selectedSignatureStyle)) ||
                (signatureTab === 'draw' && !signatureData.signatureImage)
              }
              className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing...
                </>
              ) : (
                <>
                  <Edit3 className="w-5 h-5" />
                  Sign Document
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignDocument;
