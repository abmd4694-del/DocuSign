import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, ArrowLeft } from 'lucide-react';
import { documentService } from '../services';
import toast from 'react-hot-toast';

const RecipientsSetup = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipients, setRecipients] = useState([
        { name: '', email: '', role: 'Signer' }
    ]);
    const [settings, setSettings] = useState({
        setOrder: false,
        changePermissions: false,
    });
    const [loading, setLoading] = useState(false);
    const [document, setDocument] = useState(null);

    useEffect(() => {
        // Fetch doc to show details (optional context)
        const fetchDoc = async () => {
            try {
                const response = await documentService.getById(id);
                setDocument(response.data);
            } catch (err) {
                console.error(err);
                // Silently ignore — document name in header is optional UI context
            }
        };
        fetchDoc();
    }, [id]);


    const handleAddRecipient = () => {
        setRecipients([...recipients, { name: '', email: '', role: 'Signer' }]);
    };

    const handleRemoveRecipient = (index) => {
        if (recipients.length > 1) {
            setRecipients(recipients.filter((_, i) => i !== index));
        }
    };

    const handleChange = (index, field, value) => {
        const updated = [...recipients];
        updated[index][field] = value;
        setRecipients(updated);
    };

    const handleSendRequest = async () => {
        const invalid = recipients.find((r) => !r.name.trim() || !r.email.trim());
        if (invalid) {
            toast.error('Please fill in all recipient details');
            return;
        }
        setLoading(true);
        try {
            await documentService.sendRequest(id, recipients);
            // On success, go back to document view
            toast.success('Signature request sent!');
            navigate(`/document/${id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(`/document/${id}`)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Add Recipients</h1>
                            {document && <p className="text-sm text-gray-500">for {document.originalName}</p>}
                        </div>
                     </div>
                </div>
                
                <div className="p-8 space-y-8">
                     {/* Info Banner */}
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                        <span className="text-lg">ℹ️</span>
                        <div>
                            <p className="font-medium">Step 1: Define Who Signs</p>
                            <p className="text-blue-600/80 mt-1">Add the people who need to sign this document. They will receive an email with a secure link.</p>
                        </div>
                    </div>

                    {/* Recipients List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                                Recipients
                            </p>
                        </div>

                        <div className="space-y-3">
                            {recipients.map((recipient, index) => (
                                <div key={index} className="flex items-center gap-3 animate-fadeIn">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 text-sm font-bold shrink-0">
                                        {index + 1}
                                    </span>

                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={recipient.name}
                                            onChange={(e) => handleChange(index, 'name', e.target.value)}
                                            placeholder="Name"
                                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                        <input
                                            type="email"
                                            value={recipient.email}
                                            onChange={(e) => handleChange(index, 'email', e.target.value)}
                                            placeholder="Email"
                                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div className="w-24 shrink-0">
                                        <select
                                            value={recipient.role}
                                            onChange={(e) => handleChange(index, 'role', e.target.value)}
                                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white cursor-pointer"
                                        >
                                            <option value="Signer">Signer</option>
                                            <option value="Viewer">Viewer</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveRecipient(index)}
                                        disabled={recipients.length === 1}
                                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                        title="Remove recipient"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddRecipient}
                            className="mt-2 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-primary-200 rounded-xl text-sm font-medium text-primary-600 hover:border-primary-500 hover:bg-primary-50 transition-all group"
                        >
                            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Add another recipient
                        </button>
                    </div>

                    {/* Settings */}
                    <div className="pt-6 border-t border-gray-100">
                         <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
                            Workflow Settings
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-colors group">
                                <input
                                    type="checkbox"
                                    checked={settings.setOrder}
                                    onChange={(e) => setSettings({ ...settings, setOrder: e.target.checked })}
                                    className="mt-1 w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700">Set signing order</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Recipients sign sequentially</p>
                                </div>
                            </label>

                             <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-colors group">
                                <input
                                    type="checkbox"
                                    checked={settings.changePermissions}
                                    onChange={(e) => setSettings({ ...settings, changePermissions: e.target.checked })}
                                    className="mt-1 w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700">Manage permissions</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Advanced access control</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex items-center justify-between">
                     <button
                        onClick={() => navigate(`/document/${id}`)}
                        className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSendRequest}
                        disabled={loading}
                        className="px-8 py-2.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Request'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipientsSetup;
