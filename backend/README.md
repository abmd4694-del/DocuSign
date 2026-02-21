# DocSign — Backend API

Node.js/Express REST API for the DocSign Digital Signature SaaS application.

---

## 🚀 Quick Start

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev            # development (auto-restart)
npm start              # production
```

Server runs on **http://localhost:5000**

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable       | Description                                 |
| -------------- | ------------------------------------------- |
| `PORT`         | Server port (default: 5000)                 |
| `NODE_ENV`     | `development` or `production`               |
| `MONGODB_URI`  | MongoDB Atlas connection string             |
| `JWT_SECRET`   | Secret key for JWT tokens                   |
| `JWT_EXPIRE`   | Token expiry e.g. `7d`                      |
| `CORS_ORIGIN`  | Frontend URL (comma-separated for multiple) |
| `FRONTEND_URL` | Frontend URL used in email links            |
| `SMTP_HOST`    | SMTP server e.g. `smtp.gmail.com`           |
| `SMTP_PORT`    | SMTP port e.g. `465`                        |
| `SMTP_USER`    | Your email address                          |
| `SMTP_PASS`    | Gmail App Password                          |
| `FROM_NAME`    | Email sender display name e.g. `DocSign`    |
| `FROM_EMAIL`   | Email sender address                        |

---

## 📡 API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint               | Description           | Auth |
| ------ | ---------------------- | --------------------- | ---- |
| POST   | `/register`            | Register new user     | ❌   |
| POST   | `/login`               | Login & get JWT token | ❌   |
| GET    | `/verify-email/:token` | Verify email address  | ❌   |
| GET    | `/me`                  | Get current user      | ✅   |

### Documents (`/api/docs`)

| Method | Endpoint        | Description            | Auth |
| ------ | --------------- | ---------------------- | ---- |
| POST   | `/upload`       | Upload a PDF document  | ✅   |
| GET    | `/`             | Get all user documents | ✅   |
| GET    | `/:id`          | Get single document    | ✅   |
| DELETE | `/:id`          | Delete a document      | ✅   |
| GET    | `/:id/download` | Download signed PDF    | ✅   |

### Signatures (`/api/signatures`)

| Method | Endpoint           | Description                       | Auth |
| ------ | ------------------ | --------------------------------- | ---- |
| POST   | `/finalize`        | Sign a document (authenticated)   | ✅   |
| POST   | `/finalize-public` | Sign a document (guest via token) | ❌   |

### Recipients / Share (`/api/share`)

| Method | Endpoint         | Description                          | Auth |
| ------ | ---------------- | ------------------------------------ | ---- |
| POST   | `/send`          | Send signature request to recipients | ✅   |
| GET    | `/verify/:token` | Verify signing token                 | ❌   |

### Audit Logs (`/api/audit`)

| Method | Endpoint       | Description                  | Auth |
| ------ | -------------- | ---------------------------- | ---- |
| GET    | `/:documentId` | Get audit log for a document | ✅   |

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Register, login, verify email
│   ├── documentController.js # Upload, list, download
│   ├── signatureController.js # Sign documents
│   ├── shareController.js   # Send signing requests
│   └── auditController.js   # Audit logs
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── upload.js            # Multer file upload
│   ├── auditLogger.js       # Event logging
│   └── errorHandler.js      # Global error handler
├── models/
│   ├── User.js              # User schema
│   ├── Document.js          # Document schema
│   ├── Signature.js         # Signature schema
│   ├── SignatureRequest.js   # Signing request schema
│   └── AuditLog.js          # Audit log schema
├── routes/
│   ├── authRoutes.js
│   ├── documentRoutes.js
│   ├── signatureRoutes.js
│   ├── shareRoutes.js
│   └── auditRoutes.js
├── utils/
│   ├── emailService.js      # Nodemailer email sending
│   ├── generateToken.js     # JWT generation
│   └── tokenService.js      # Signing token helpers
├── uploads/                 # PDF storage (git-ignored)
├── Dockerfile               # Docker config for Render
├── .dockerignore
├── .env.example             # Environment variable template
└── server.js                # App entry point
```

---

## 🐳 Docker Deployment (Render)

The backend is containerized with Docker for deployment on Render.

```bash
# Build locally to test
docker build -t docsign-backend .
docker run -p 5000:5000 --env-file .env docsign-backend
```

**Render setup:**

- Environment: `Docker`
- Root Directory: `backend`
- Add all env variables in Render dashboard

---

## 🛡️ Security Features

- JWT authentication on protected routes
- Password hashing with bcrypt
- NoSQL injection protection (express-mongo-sanitize)
- Input validation (express-validator)
- CORS restricted to frontend origin
- Secure token-based guest signing

---

## 📦 Dependencies

| Package                | Purpose                    |
| ---------------------- | -------------------------- |
| express                | Web framework              |
| mongoose               | MongoDB ODM                |
| jsonwebtoken           | JWT auth                   |
| bcrypt                 | Password hashing           |
| multer                 | File uploads               |
| pdf-lib                | PDF signature embedding    |
| nodemailer             | Email sending              |
| express-mongo-sanitize | NoSQL injection protection |
| express-validator      | Input validation           |
| dotenv                 | Environment variables      |
| cors                   | CORS headers               |
