import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentService, signatureService } from '../services';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit3, Type, Pen, Users, User, ChevronDown } from 'lucide-react';
import PDFViewer from '../components/PDFViewer';
import SignatureCanvas from '../components/SignatureCanvas';
import SignatureStyleSelector from '../components/SignatureStyleSelector';
import RecipientsModal from '../components/RecipientsModal';

const DocumentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Signing mode: 'only-me' | 'several-people'
  const [signingMode, setSigningMode] = useState('only-me');
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);

  // Signature state
  const [signatureTab, setSignatureTab] = useState('type');
  const [signatureName, setSignatureName] = useState('');
  const [selectedSignatureStyle, setSelectedSignatureStyle] = useState(null);
  const [signatureData, setSignatureData] = useState({
    signatureText: '',
    signatureImage: null,
    signatureStyle: null,
    x: 100,
    y: 700,
    page: 0,
    viewerWidth: 710,
    viewerHeight: 1000,
  });

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await documentService.getById(id);
      setDocument(response.data);
    } catch (error) {
      toast.error('Failed to fetch document');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStyleSelect = (style) => {
    setSelectedSignatureStyle(style);
    setSignatureData({
      ...signatureData,
      signatureText: signatureName,
      signatureStyle: style,
    });
  };

  const handleDrawnSignature = (dataUrl) => {
    setSignatureData({ ...signatureData, signatureImage: dataUrl });
    toast.success('Signature captured! Position it on the document.');
  };

  // Convert typed signature to image so the selected font style is preserved in the PDF
  const generateSignatureImage = (text, style) => {
    const canvas = window.document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800; // Increased resolution
    canvas.height = 200;

    // White background (needed for JPEG — no transparency)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const fontSize = 96; // Increased font size
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
    console.log('=== HANDLE SIGN START ===');
    console.log('signatureTab:', signatureTab);
    console.log('signatureName:', signatureName);
    console.log('selectedSignatureStyle:', selectedSignatureStyle);
    
    if (signatureTab === 'type' && !signatureName) {
      toast.error('Please enter your name');
      return;
    }
    if (signatureTab === 'type' && !selectedSignatureStyle) {
      toast.error('Please select a signature style');
      return;
    }
    if (signatureTab === 'draw' && !signatureData.signatureImage) {
      toast.error('Please draw your signature');
      return;
    }

    try {
      let finalSignatureImage = signatureData.signatureImage;
      
      if (signatureTab === 'type') {
        console.log('Generating signature image...');
        try {
          finalSignatureImage = generateSignatureImage(signatureName, selectedSignatureStyle);
          console.log('Image generated, length:', finalSignatureImage?.length);
        } catch (genError) {
          console.error('generateSignatureImage CRASHED:', genError);
          toast.error('Failed to generate signature image: ' + genError.message);
          return;
        }
      }

      setIsSigning(true);

      const signaturePayload = {
        documentId: id,
        signatureText: signatureName || '',
        signatureImage: finalSignatureImage,
        x: signatureData.x,
        y: signatureData.y,
        page: signatureData.page,
        viewerWidth: signatureData.viewerWidth,
        viewerHeight: signatureData.viewerHeight,
      };

      console.log('Sending payload, image size:', finalSignatureImage?.length, 'bytes');
      const response = await signatureService.finalize(signaturePayload);
      console.log('Sign response:', response);
      toast.success('Document signed successfully!');
      setSignatureName('');
      setSelectedSignatureStyle(null);
      setSignatureData({ signatureText: '', signatureImage: null, signatureStyle: null, x: 100, y: 700, page: 0, viewerWidth: 710, viewerHeight: 1000 });
      fetchDocument();
    } catch (error) {
      console.error('=== SIGNING ERROR ===');
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Full error:', error);
      toast.error(error.response?.data?.message || error.message || 'Signing failed');
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownload = () => {
    try {
      setIsDownloading(true);
      // Use the dedicated download endpoint which handles CORS and headers correctly
      const downloadUrl = `${API_BASE_URL}/api/docs/${id}/download`;
      
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
      toast.error('Failed to trigger download');
      setIsDownloading(false);
    }
  };

  const showSignatureOverlay =
    document?.status === 'Pending' &&
    signingMode === 'only-me' &&
    (selectedSignatureStyle !== null || signatureData.signatureImage !== null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Determine API base URL dynamically
  const API_BASE_URL = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : `${window.location.protocol}//${window.location.hostname}:5000`;

  const pdfUrl = `${API_BASE_URL}/${document.filePath.replace(/\\/g, '/')}?t=${document.signedAt || document.uploadDate}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{document.originalName}</h1>
            <p className="text-xs text-gray-500">
              Uploaded on {new Date(document.uploadDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span
          className={`badge ${
            document.status === 'Signed'
              ? 'badge-signed'
              : document.status === 'Rejected'
              ? 'badge-rejected'
              : 'badge-pending'
          }`}
        >
          {document.status}
        </span>
      </div>

      {/* Main Split Layout */}
      <div className="flex h-[calc(100vh-57px)]">

        {/* ── LEFT: PDF Viewer ── */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <PDFViewer
            fileUrl={pdfUrl}
            showSignature={showSignatureOverlay}
            signatureText={signatureName}
            signatureStyle={selectedSignatureStyle}
            signatureImage={signatureData.signatureImage}
            onPositionChange={(pos) =>
              setSignatureData((prev) => ({ ...prev, x: pos.x, y: pos.y, page: pos.page ?? prev.page, viewerWidth: pos.viewerWidth || prev.viewerWidth, viewerHeight: pos.viewerHeight || prev.viewerHeight }))
            }
          />
        </div>

        {/* ── RIGHT: Control Panel ── */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">

          {/* Signed Banner */}
          {document.status === 'Signed' && (
            <div className="m-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium text-sm">✅ Document Signed</p>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="mt-2 inline-flex items-center gap-2 text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
              >
                {isDownloading ? 'Downloading...' : '⬇️ Download Signed PDF'}
              </button>
            </div>
          )}

          {/* Signing Controls (only for Pending docs) */}
          {document.status === 'Pending' && (
            <div className="flex-1 p-4 space-y-5">

              {/* ── Who Will Sign Dropdown ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Who will sign?
                </label>
                <div className="relative">
                  <button
                    onClick={() => setModeDropdownOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:border-primary-500 transition-colors text-sm font-medium text-gray-800"
                  >
                    <span className="flex items-center gap-2">
                      {signingMode === 'only-me' ? (
                        <><User className="w-4 h-4 text-primary-600" /> Only Me</>
                      ) : (
                        <><Users className="w-4 h-4 text-primary-600" /> Several People</>
                      )}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${modeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {modeDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={() => { setSigningMode('only-me'); setModeDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${signingMode === 'only-me' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'}`}
                      >
                        <User className="w-4 h-4" />
                        <div className="text-left">
                          <p className="font-medium">Only Me</p>
                          <p className="text-xs text-gray-500">Sign this document yourself</p>
                        </div>
                      </button>
                      <button
                        onClick={() => { navigate(`/document/${id}/prepare-sign`); setModeDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${signingMode === 'several-people' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'}`}
                      >
                        <Users className="w-4 h-4" />
                        <div className="text-left">
                          <p className="font-medium">Several People</p>
                          <p className="text-xs text-gray-500">Invite others to sign</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── ONLY ME: Signature Tools ── */}
              {signingMode === 'only-me' && (
                <div className="space-y-4">
                  {/* Tab Switcher */}
                  <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setSignatureTab('type')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                        signatureTab === 'type'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Type className="w-4 h-4" /> Type
                    </button>
                    <button
                      onClick={() => setSignatureTab('draw')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                        signatureTab === 'draw'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Pen className="w-4 h-4" /> Draw
                    </button>
                  </div>

                  {/* Type Signature */}
                  {signatureTab === 'type' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Your Full Name</label>
                        <input
                          type="text"
                          value={signatureName}
                          onChange={(e) => setSignatureName(e.target.value)}
                          className="input-field"
                          placeholder="John Doe"
                        />
                      </div>
                      {signatureName && (
                        <SignatureStyleSelector
                          name={signatureName}
                          onSelectStyle={handleStyleSelect}
                        />
                      )}
                    </div>
                  )}

                  {/* Draw Signature */}
                  {signatureTab === 'draw' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Draw Your Signature</label>
                      <SignatureCanvas
                        onSave={handleDrawnSignature}
                        onClear={() => setSignatureData({ ...signatureData, signatureImage: null })}
                      />
                    </div>
                  )}

                  {/* Position Hint */}
                  {showSignatureOverlay && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                      📍 <strong>Drag</strong> the signature on the PDF to position it, then click Sign.
                    </div>
                  )}

                  {/* Sign Button */}
                  <button
                    onClick={handleSign}
                    disabled={
                      isSigning ||
                      (signatureTab === 'type' && (!signatureName || !selectedSignatureStyle)) ||
                      (signatureTab === 'draw' && !signatureData.signatureImage)
                    }
                    className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSigning ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                    {isSigning ? 'Signing...' : 'Sign Document'}
                  </button>
                </div>
              )}


            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentView;
