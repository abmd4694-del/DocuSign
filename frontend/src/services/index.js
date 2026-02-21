import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    // Modified: Register no longer returns a token immediately, wait for verification
    return response.data;
  },

  resendVerificationCode: async (email) => {
    const response = await api.post('/auth/resend-code', { email });
    return response.data;
  },

  verifyEmail: async (email, code) => {
    const response = await api.post('/auth/verify-email', { email, code });
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export const documentService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('document', file);
    const response = await api.post('/docs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/docs');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/docs/${id}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/docs/${id}`);
    return response.data;
  },

  undo: async (id) => {
    const response = await api.post(`/docs/${id}/undo`);
    return response.data;
  },

  sendRequest: async (id, recipients) => {
    const response = await api.post(`/docs/${id}/send`, { recipients });
    return response.data;
  },
};

export const signatureService = {
  finalize: async (signatureData) => {
    const response = await api.post('/signatures/finalize', signatureData);
    return response.data;
  },

  getByDocument: async (docId) => {
    const response = await api.get(`/signatures/${docId}`);
    return response.data;
  },
};

export const shareService = {
  createRequest: async (requestData) => {
    const response = await api.post('/share/request', requestData);
    return response.data;
  },

  getDocumentByToken: async (token) => {
    const response = await api.get(`/share/document/${token}`);
    return response.data;
  },

  rejectRequest: async (token, reason) => {
    const response = await api.post(`/share/reject/${token}`, { reason });
    return response.data;
  },

  getRequests: async (docId) => {
    const response = await api.get(`/share/requests/${docId}`);
    return response.data;
  },
};

export const auditService = {
  getByDocument: async (docId) => {
    const response = await api.get(`/audit/${docId}`);
    return response.data;
  },

  getUserLogs: async () => {
    const response = await api.get('/audit/user/me');
    return response.data;
  },
};
