import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../services';
import toast from 'react-hot-toast';
import { Upload, FileText, Trash2, Eye, Clock } from 'lucide-react';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await documentService.getAll();
      setDocuments(response.data);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    setUploading(true);
    try {
      await documentService.upload(file);
      toast.success('Document uploaded successfully');
      fetchDocuments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentService.delete(id);
      toast.success('Document deleted');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'badge-pending',
      Signed: 'badge-signed',
      Rejected: 'badge-rejected',
    };
    return `badge ${badges[status] || 'badge-pending'}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
          <p className="mt-2 text-gray-600">
            Upload, manage, and sign your documents
          </p>
        </div>

        {/* Upload Section */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">Upload New Document</h2>
              <p className="text-sm text-gray-600">
                Upload a PDF file to get started
              </p>
            </div>
            <label className="btn-primary cursor-pointer flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>{uploading ? 'Uploading...' : 'Upload PDF'}</span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Documents List */}
        {documents.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No documents yet
            </h3>
            <p className="text-gray-600">
              Upload your first document to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div key={doc._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <FileText className="h-10 w-10 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {doc.originalName}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </span>
                        <span>{(doc.fileSize / 1024).toFixed(2)} KB</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={getStatusBadge(doc.status)}>
                      {doc.status}
                    </span>
                    <button
                      onClick={() => navigate(`/document/${doc._id}`)}
                      className="btn-secondary flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="btn-danger flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
