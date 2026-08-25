# DocSign — Digital Signature SaaS

A full-stack digital document signing platform that allows users to upload PDF documents, sign them digitally, send documents to other recipients for signatures, and track document status and audit activity.

The application consists of a **React/Vite frontend** and a **Node.js/Express backend**, with MongoDB used for data persistence.

## Features

* User registration and login
* JWT-based authentication
* Email verification
* Secure password hashing with bcrypt
* PDF document upload
* Document management
* PDF document preview
* Coordinate-based digital signatures
* Send documents to recipients for signing
* Guest signing through secure signing tokens
* Track document status
* Download signed PDFs
* Document audit logs
* Email notifications
* Input validation
* NoSQL injection protection
* Responsive user interface
* Docker support for backend deployment

## Tech Stack

### Frontend

* React 18
* Vite
* React Router
* Tailwind CSS
* Axios
* React Hot Toast
* Lucide React
* react-pdf

### Backend

* Node.js
* Express
* MongoDB
* Mongoose
* JWT
* bcrypt
* Multer
* pdf-lib
* Nodemailer
* express-validator
* express-mongo-sanitize
* CORS
* dotenv

### Deployment

* Vercel / Netlify — Frontend
* Docker / Render — Backend

The frontend README documents the React/Vite/Tailwind stack, while the backend uses Express, Mongoose, PDF processing, email services, and JWT authentication.

## Architecture

```text
                    ┌─────────────────────────┐
                    │        Frontend         │
                    │                         │
                    │ React 18 + Vite         │
                    │ React Router             │
                    │ Tailwind CSS             │
                    │ Axios                    │
                    └────────────┬────────────┘
                                 │
                                 │ REST API
                                 ▼
                    ┌─────────────────────────┐
                    │         Backend         │
                    │                         │
                    │ Node.js + Express       │
                    │ JWT Authentication      │
                    │ PDF Processing           │
                    │ Email Service            │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
             ┌──────────────┐         ┌──────────────┐
             │   MongoDB    │         │    SMTP      │
             │              │         │   Email      │
             │ Users        │         │   Service    │
             │ Documents    │         └──────────────┘
             │ Signatures   │
             │ Audit Logs   │
             └──────────────┘
```

## Project Structure

```text
DocuSign/
│
├── backend/
│   ├── config/
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── documentController.js
│   │   ├── signatureController.js
│   │   ├── shareController.js
│   │   └── auditController.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── upload.js
│   │   ├── auditLogger.js
│   │   └── errorHandler.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Document.js
│   │   ├── Signature.js
│   │   ├── SignatureRequest.js
│   │   └── AuditLog.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── signatureRoutes.js
│   │   ├── shareRoutes.js
│   │   └── auditRoutes.js
│   │
│   ├── utils/
│   │   ├── emailService.js
│   │   ├── generateToken.js
│   │   └── tokenService.js
│   │
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── PrivateRoute.jsx
    │   │
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── DocumentView.jsx
    │   │
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   │
    │   ├── services/
    │   │   ├── api.js
    │   │   └── index.js
    │   │
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    │
    ├── public/
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

The structure above reflects the current repository organization.

---

# Getting Started

## Prerequisites

Install the following before running the project:

* Node.js
* npm
* MongoDB or MongoDB Atlas
* Git

For email functionality, you will also need an SMTP account.

## 1. Clone the Repository

```bash
git clone https://github.com/abmd4694-del/DocuSign.git
cd DocuSign
```

---

# Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

## Backend Environment Variables

Configure `.env`:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password

FROM_NAME=DocSign
FROM_EMAIL=your_email@example.com
```

The backend's current environment configuration includes MongoDB, JWT, CORS/frontend URLs, and SMTP settings.

## Start the Backend

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

---

# Frontend Setup

Open a new terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The Vite development server will normally be available at:

```text
http://localhost:5173
```

The frontend's current documentation specifies `VITE_API_URL` for connecting to the backend API.

---

# Using the Application

### 1. Create an Account

Open the application and select **Register**.

Create a new account using your name, email address, and password.

### 2. Verify Your Email

Complete the email verification process if email verification is enabled.

### 3. Log In

Sign in using your registered credentials.

The application uses JWT authentication for protected resources.

### 4. Upload a Document

From the dashboard:

1. Select the document upload option.
2. Choose a PDF file.
3. Upload the document.
4. Open the uploaded document.

### 5. Sign a Document

Open a document and use the signing interface to place your signature at the required coordinates.

### 6. Send for Signature

Documents can be shared with recipients through signature requests.

Recipients can use the provided signing token to access and sign the document.

### 7. Track Status

The application allows documents to be tracked through statuses such as:

* Pending
* Signed
* Rejected

### 8. Download Signed Documents

Once the signing process is completed, the signed PDF can be downloaded.

### 9. View Audit Logs

Authenticated users can view the audit history associated with their documents.

The current frontend workflow covers registration/login, document upload, signing, sharing, status tracking, and audit-log usage.

---

# API

The backend exposes REST endpoints under `/api`.

## Authentication

| Method | Endpoint                        | Description           | Authentication |
| ------ | ------------------------------- | --------------------- | -------------- |
| POST   | `/api/auth/register`            | Register a user       | No             |
| POST   | `/api/auth/login`               | Login and receive JWT | No             |
| GET    | `/api/auth/verify-email/:token` | Verify email          | No             |
| GET    | `/api/auth/me`                  | Get current user      | Yes            |

## Documents

| Method | Endpoint                 | Description          | Authentication |
| ------ | ------------------------ | -------------------- | -------------- |
| POST   | `/api/docs/upload`       | Upload PDF           | Yes            |
| GET    | `/api/docs`              | Get user's documents | Yes            |
| GET    | `/api/docs/:id`          | Get document         | Yes            |
| DELETE | `/api/docs/:id`          | Delete document      | Yes            |
| GET    | `/api/docs/:id/download` | Download signed PDF  | Yes            |

## Signatures

| Method | Endpoint                          | Description     | Authentication |
| ------ | --------------------------------- | --------------- | -------------- |
| POST   | `/api/signatures/finalize`        | Sign a document | Yes            |
| POST   | `/api/signatures/finalize-public` | Guest signing   | No             |

## Sharing

| Method | Endpoint                   | Description          | Authentication |
| ------ | -------------------------- | -------------------- | -------------- |
| POST   | `/api/share/send`          | Send signing request | Yes            |
| GET    | `/api/share/verify/:token` | Verify signing token | No             |

## Audit Logs

| Method | Endpoint                 | Description            | Authentication |
| ------ | ------------------------ | ---------------------- | -------------- |
| GET    | `/api/audit/:documentId` | Get document audit log | Yes            |

These routes correspond to the current backend API documentation in the repository.

---

# Security

The backend includes several security mechanisms:

* JWT authentication
* Password hashing with bcrypt
* Protected API routes
* Input validation
* NoSQL injection protection
* CORS configuration
* Token-based guest signing
* Environment-based secret management
* Audit logging

The backend specifically uses `bcrypt`, `express-validator`, and `express-mongo-sanitize` for security-related functionality.

## Important

Never commit the `.env` file to GitHub.

Do not expose:

* MongoDB credentials
* JWT secret
* SMTP password
* Email credentials
* Production API keys

---

# Docker

The backend includes a Dockerfile for containerized deployment.

Build the backend image:

```bash
docker build -t docsign-backend ./backend
```

Run the container:

```bash
docker run -p 5000:5000 --env-file ./backend/.env docsign-backend
```

The repository's backend documentation also specifies Docker/Render deployment with `backend` as the root directory.

---

# Deployment

## Frontend

The frontend can be built using:

```bash
cd frontend
npm run build
```

The generated production files can be deployed using platforms such as Vercel or Netlify.

The frontend repository configuration includes Vercel deployment support.

## Backend

The backend can be deployed using Docker-based hosting such as Render.

For production deployment:

1. Configure all environment variables.
2. Configure the MongoDB connection.
3. Configure the frontend URL.
4. Configure SMTP credentials.
5. Configure CORS.
6. Deploy the Docker container.
7. Update `VITE_API_URL` in the frontend to point to the deployed backend.

---

# Future Improvements

Potential future improvements include:

* Multiple signature fields
* Drag-and-drop signature placement
* Additional document formats
* Document templates
* Multiple recipients and signing order
* Email reminders
* Expiring signing links
* Advanced document search
* Document folders
* Team/workspace support
* Role-based access control
* Improved audit history
* Cloud object storage for documents
* Digital certificate-based signatures
* Two-factor authentication
* Rate limiting
* Automated testing
* CI/CD pipeline

---

# License

No license is currently specified for this repository.

If this project is intended to be distributed as open source, add an appropriate `LICENSE` file and update this section.

---

# Author

**abmd4694-del**

GitHub: https://github.com/abmd4694-del

## Repository

https://github.com/abmd4694-del/DocuSign

---

## Disclaimer

This project is an independent digital-signature application and is **not affiliated with or endorsed by DocuSign, Inc.**

The project name and branding should be changed if necessary to avoid confusion with the commercial DocuSign service.
