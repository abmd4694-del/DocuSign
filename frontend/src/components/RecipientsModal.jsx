import { useState } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { documentService } from '../services';
import toast from 'react-hot-toast';

const RecipientsModal = ({ documentId, onClose, onSuccess }) => {
  const [recipients, setRecipients] = useState([
    { name: '', email: '', role: 'Signer' }
  ]);
  const [settings, setSettings] = useState({
    setOrder: false,
    changePermissions: false,
  });
  const [loading, setLoading] = useState(false);

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
      await documentService.sendRequest(documentId, recipients);
      toast.success('Signature request sent!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-gray-900">Create your signature request</h2>
        <div className="mt-2 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-800">
          <span className="mt-0.5">ℹ️</span>
          <span>Fill in the information of each receiver.</span>
        </div>
      </div>

      {/* Recipients List */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Who will receive your document?
        </p>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {recipients.map((recipient, index) => (
            <div key={index} className="flex items-center gap-2">
              {/* Number */}
              <span className="text-xs text-gray-400 font-semibold w-4 shrink-0">{index + 1}.</span>

              {/* Name */}
              <input
                type="text"
                value={recipient.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
                placeholder="Name"
                className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />

              {/* Email */}
              <input
                type="email"
                value={recipient.email}
                onChange={(e) => handleChange(index, 'email', e.target.value)}
                placeholder="Email"
                className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />

              {/* Role */}
              <select
                value={recipient.role}
                onChange={(e) => handleChange(index, 'role', e.target.value)}
                className="px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="Signer">Si</option>
                <option value="Viewer">Vi</option>
              </select>

              {/* Remove */}
              <button
                onClick={() => handleRemoveRecipient(index)}
                disabled={recipients.length === 1}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Receiver Button */}
        <button
          onClick={handleAddRecipient}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-primary-300 rounded-lg text-sm font-medium text-primary-600 hover:border-primary-500 hover:bg-primary-50 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add receiver
        </button>
      </div>

      {/* Settings */}
      <div className="border-t pt-4 space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Settings</p>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={settings.setOrder}
            onChange={(e) => setSettings({ ...settings, setOrder: e.target.checked })}
            className="mt-0.5 w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          />
          <div>
            <p className="text-sm text-gray-800 font-medium group-hover:text-gray-900">Set the order of receivers</p>
            {settings.setOrder && (
              <p className="text-xs text-gray-500 mt-0.5">
                A signer won't receive a request until the previous person has completed their document.
              </p>
            )}
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={settings.changePermissions}
            onChange={(e) => setSettings({ ...settings, changePermissions: e.target.checked })}
            className="mt-0.5 w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          />
          <div>
            <p className="text-sm text-gray-800 font-medium group-hover:text-gray-900">Change permissions</p>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t mt-auto">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSendRequest}
          disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Apply'}
        </button>
      </div>
    </div>
  );
};

export default RecipientsModal;
