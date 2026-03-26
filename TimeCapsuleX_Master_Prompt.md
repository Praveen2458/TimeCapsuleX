# TimeCapsuleX – Master Build Prompt

## ROLE
You are a senior full-stack engineer. Your job is to help me build **TimeCapsuleX** — a secure, time-locked content sharing platform. Guide me step by step, write production-quality code, explain every decision, and never skip security or architecture details.

---

## PROJECT OVERVIEW
TimeCapsuleX lets users create encrypted "capsules" (messages or media) that are locked behind a time gate and accessible only via a unique, unguessable URL. After the unlock time passes, recipients can view the capsule. Capsules can optionally self-destruct after being viewed once.

This is NOT a basic CRUD app. It must demonstrate:
- Background job scheduling
- AES encryption at rest
- Rate limiting and security hardening
- Real-time countdown on the frontend
- Email notifications
- File/media upload with cloud storage
- Input validation and proper error handling

---

## TECH STACK

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Cache / Token Store:** Redis (via ioredis)
- **Job Scheduler:** BullMQ (Redis-backed queue) or node-cron
- **Authentication:** JWT (access token + refresh token pattern)
- **Encryption:** Node.js built-in `crypto` module (AES-256-CBC)
- **Email:** Nodemailer with Gmail SMTP or SendGrid
- **File Uploads:** Multer + Cloudinary (for media capsules)
- **Validation:** Joi or Zod
- **Security Middleware:** Helmet, express-rate-limit, cors
- **Testing:** Jest + Supertest (at least for critical routes)

### Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Countdown Timer:** Custom hook using `setInterval`
- **Animations:** Framer Motion or CSS transitions
- **Routing:** React Router v6

### DevOps / Deployment
- **Frontend:** Vercel
- **Backend:** Render or Railway
- **Database:** MongoDB Atlas
- **Media Storage:** Cloudinary (free tier)
- **Redis:** Upstash Redis (free tier, HTTP-compatible with ioredis)

---

## FOLDER STRUCTURE

```
timecapsule-x/
│
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CountdownTimer.jsx
│   │   │   ├── CapsuleForm.jsx
│   │   │   ├── CapsuleViewer.jsx
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── CreateCapsule.jsx
│   │   │   ├── ViewCapsule.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── hooks/
│   │   │   └── useCountdown.js
│   │   ├── services/
│   │   │   └── api.js             # Axios instance + API calls
│   │   └── App.jsx
│   └── package.json
│
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── capsuleController.js
│   ├── models/
│   │   ├── User.js
│   │   └── Capsule.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── capsuleRoutes.js
│   ├── jobs/
│   │   └── capsuleJobs.js         # BullMQ workers / cron jobs
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── encryption.js          # AES-256 encrypt/decrypt
│   │   ├── generateToken.js       # UUID + JWT helpers
│   │   └── sendEmail.js           # Nodemailer helper
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── redis.js               # Redis/Upstash connection
│   ├── validators/
│   │   └── capsuleValidator.js    # Joi/Zod schemas
│   ├── tests/
│   │   └── capsule.test.js        # Jest + Supertest
│   ├── app.js                     # Express app setup
│   ├── server.js                  # Entry point
│   └── package.json
│
├── .env.example
└── README.md
```

---

## DATABASE SCHEMA

### User Model
```js
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (bcrypt hashed),
  createdAt: Date
}
```

### Capsule Model
```js
{
  _id: ObjectId,
  slug: String,           // UUID-based, e.g. "9xA7bK2LmP" — unique, indexed
  createdBy: ObjectId,    // ref: User (optional for anonymous)
  
  // Content — always encrypted before saving
  encryptedContent: String,   // AES-256 encrypted text
  iv: String,                 // Initialization vector for AES
  mediaUrl: String,           // Cloudinary URL (optional)

  unlockAt: Date,             // When the capsule becomes accessible
  isUnlocked: Boolean,        // Updated by cron job when unlockAt passes
  
  // Self-destruct
  selfDestruct: Boolean,      // If true, delete after first view
  viewedAt: Date,             // Timestamp of first view

  // Password protection
  isPasswordProtected: Boolean,
  passwordHash: String,       // bcrypt hash of optional access password

  // Notifications
  notifyEmail: String,        // Email to notify when unlocked

  // Recipients (shared capsule)
  allowedEmails: [String],    // Optional list of allowed viewer emails

  views: Number,              // View count
  createdAt: Date,
  expiresAt: Date             // TTL — auto-delete from DB after this date
}
```

---

## API DESIGN (Versioned)

### Base URL: `/api/v1`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register user | No |
| POST | `/auth/login` | Login, get JWT | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/capsules` | Create a new capsule | Optional |
| GET | `/capsules/:slug` | Get capsule by slug (enforces time-lock) | No |
| POST | `/capsules/:slug/unlock` | Unlock password-protected capsule | No |
| GET | `/capsules/my` | Get all capsules by current user | Yes |
| DELETE | `/capsules/:slug` | Delete own capsule | Yes |

---

## CORE LOGIC TO IMPLEMENT

### 1. Capsule Creation (`POST /api/v1/capsules`)
- Validate input with Joi/Zod
- Generate a 10-character alphanumeric slug using `nanoid`
- Encrypt content using AES-256-CBC before saving
- Store `iv` (initialization vector) alongside encrypted content
- If `notifyEmail` provided → schedule a BullMQ job to send email at `unlockAt`
- Return the unique capsule URL to the user

### 2. Time-Lock Logic (`GET /api/v1/capsules/:slug`)
- Find capsule by slug
- If `Date.now() < capsule.unlockAt` → return `{ locked: true, unlockAt }` — frontend shows countdown
- If `Date.now() >= capsule.unlockAt`:
  - Decrypt content using stored `iv` and secret key
  - If `isPasswordProtected: true` → return `{ locked: false, passwordRequired: true }`
  - If `selfDestruct: true` and already viewed → return 410 Gone
  - Otherwise → return decrypted content, increment `views`, set `viewedAt`
  - If `selfDestruct: true` → schedule deletion in 60 seconds after view

### 3. AES-256 Encryption (`utils/encryption.js`)
```js
// Use Node crypto module
// encrypt(text) → returns { encryptedData, iv }
// decrypt(encryptedData, iv) → returns original text
// Never store the encryption key in the database — use environment variable
```

### 4. Background Jobs (`jobs/capsuleJobs.js`)
- **Unlock Notifier Job:** At `unlockAt` time, send email to `notifyEmail` with capsule link
- **Cleanup Job:** Daily cron at midnight — delete capsules where `expiresAt < now`
- **Self-Destruct Job:** After a viewed self-destruct capsule, delete it after 60s delay

### 5. Rate Limiting
- Apply `express-rate-limit` globally: max 100 requests / 15 min per IP
- Apply stricter limit on `POST /capsules`: max 10 requests / hour per IP
- Apply stricter limit on `GET /capsules/:slug`: max 30 requests / 15 min per IP (brute force prevention)

### 6. Security Checklist
- [ ] `helmet()` middleware on all routes
- [ ] `cors()` configured with specific frontend origin (not `*`) in production
- [ ] Passwords hashed with bcrypt (salt rounds: 12)
- [ ] JWT secret in `.env`, not hardcoded
- [ ] AES encryption key in `.env`, never in DB
- [ ] Slugs are random (nanoid), not sequential
- [ ] Input validation on every POST/PUT route
- [ ] Error messages never expose stack traces in production

---

## FRONTEND FEATURES TO BUILD

### Pages
1. **Home** – Hero section, how it works, CTA button
2. **Create Capsule** – Form with: content textarea, optional media upload, unlock date/time picker, optional password, optional notify email, self-destruct toggle
3. **View Capsule (`/capsule/:slug`):**
   - If locked → show animated countdown timer (days, hours, minutes, seconds)
   - If unlocked + password required → show password input form
   - If unlocked → reveal content with unlock animation
   - If self-destructed → show "This capsule has been destroyed" message
4. **Dashboard (auth required)** – List of user's created capsules with status badges

### Custom Hook: `useCountdown(unlockAt)`
- Takes a target date
- Returns `{ days, hours, minutes, seconds, isExpired }`
- Uses `setInterval` that clears on component unmount

### UI/UX Requirements
- Responsive on mobile and desktop
- Dark theme preferred
- Smooth CSS or Framer Motion animation on capsule reveal
- Loading skeletons while fetching capsule data
- Toast notifications for success/error states

---

## ENVIRONMENT VARIABLES (`.env.example`)
```
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_atlas_uri

# Redis (Upstash)
REDIS_URL=your_upstash_redis_url

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Encryption
AES_SECRET_KEY=your_32_char_hex_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend
CLIENT_URL=http://localhost:5173
```

---

## TESTING
Write at minimum these test cases using Jest + Supertest:
1. `POST /api/v1/capsules` → creates capsule, returns slug
2. `GET /api/v1/capsules/:slug` when locked → returns `{ locked: true }`
3. `GET /api/v1/capsules/:slug` when unlocked → returns decrypted content
4. `POST /api/v1/capsules` with invalid data → returns 400 validation error
5. Rate limiter test → after N requests returns 429

---

## BUILD ORDER (Phases)

### Phase 1 – Backend Foundation
1. Setup Express app with Helmet, CORS, rate limiting
2. Connect to MongoDB Atlas
3. Create User model + auth routes (register, login, JWT)
4. Create Capsule model

### Phase 2 – Core Capsule API
5. Build capsule controller (create + fetch)
6. Implement AES encryption utility
7. Implement slug generation with nanoid
8. Implement time-lock logic in GET route

### Phase 3 – Advanced Backend
9. Setup Redis (Upstash) connection
10. Setup BullMQ for job queues
11. Build unlock notifier job (email on unlock)
12. Build cleanup cron job
13. Add password protection logic
14. Add self-destruct logic
15. Add input validation with Joi

### Phase 4 – Frontend
16. Setup React + Vite + Tailwind
17. Build Create Capsule page + API integration
18. Build `useCountdown` hook
19. Build View Capsule page with countdown + reveal animation
20. Build Dashboard page
21. Add auth (login/register) with JWT storage

### Phase 5 – Polish & Deploy
22. Write Jest + Supertest tests
23. Add loading states, error boundaries, toast notifications
24. Deploy backend to Render, frontend to Vercel
25. Configure environment variables in both platforms
26. Test production deployment end-to-end

---

## HOW TO USE THIS PROMPT WITH COPILOT / AI

When starting each phase, use this pattern:
> "I am building TimeCapsuleX. I am on **Phase [X], Step [Y]**. Here is my current folder structure: [paste tree]. Now help me build: [specific step]."

This gives the AI full context every time and produces accurate, consistent code.

---

## RESUME DESCRIPTION (Final)
> Built **TimeCapsuleX**, a secure time-locked content sharing platform using Node.js, Express, MongoDB, and React. Implemented AES-256 encryption for content stored at rest, UUID-based slug generation to prevent URL enumeration, background job scheduling with BullMQ for automated email notifications and capsule cleanup, and rate limiting to prevent brute-force attacks. Frontend features a live countdown timer, self-destruct capsule mechanic, and password-protected access, deployed on Vercel and Render with MongoDB Atlas and Upstash Redis.
