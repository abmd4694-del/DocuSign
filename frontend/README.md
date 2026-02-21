# Document Signature SaaS - Frontend

React frontend for the Document Signature SaaS platform built with Vite, React Router, and Tailwind CSS.

## 🚀 Features

- **Modern UI** - Beautiful, responsive design with Tailwind CSS
- **Authentication** - Login and registration with JWT
- **Document Management** - Upload, view, and delete PDF documents
- **Digital Signatures** - Sign documents with coordinate-based placement
- **Sharing** - Send signature requests via email
- **Real-time Status** - Track document status (Pending, Signed, Rejected)

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── PrivateRoute.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── DocumentView.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── index.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🎨 Pages

### Home (`/`)

- Landing page with features and use cases
- Call-to-action buttons for login/register

### Login (`/login`)

- User authentication
- Form validation
- Redirect to dashboard on success

### Register (`/register`)

- New user registration
- Password validation (min 6 characters)
- Auto-login after registration

### Dashboard (`/dashboard`) 🔒

- List all user documents
- Upload new PDF files
- View document status
- Delete documents

### Document View (`/document/:id`) 🔒

- View document details
- Sign document with custom coordinates
- Share document for signature
- Track signature requests

## 🔐 Authentication

The app uses JWT tokens stored in localStorage:

- Tokens are automatically added to API requests
- Protected routes redirect to login if not authenticated
- Auto-logout on 401 responses

## 🎯 Usage

1. **Register** a new account or **Login**
2. **Upload** a PDF document from the dashboard
3. **View** the document to see details
4. **Sign** the document or **Share** it for signature
5. Track document status and audit logs

## 🚀 Deployment

### Vercel

```bash
npm run build
# Deploy dist folder to Vercel
```

### Netlify

```bash
npm run build
# Deploy dist folder to Netlify
```

## 📝 Notes

- PDF preview requires `react-pdf` library (included in dependencies)
- All API calls go through the Axios interceptor for auth
- Toast notifications for user feedback
- Responsive design works on all screen sizes

## 🔗 Backend

This frontend connects to the Node.js/Express backend. Make sure the backend is running on `http://localhost:5000`.

---

**Built with ❤️ using React and Tailwind CSS**
