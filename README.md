# 🤝 VolunteerHub — Volunteer Registration System

A full-stack volunteer management platform built with **MongoDB Atlas**, **Express.js**, and **JWT authentication**.

---

## 📦 Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | Vanilla HTML/CSS/JS (no framework)  |
| Backend      | Node.js + Express.js                |
| Database     | MongoDB Atlas (cloud NoSQL)         |
| Auth         | JWT (JSON Web Tokens) + bcryptjs    |
| Validation   | express-validator                   |

---

## ✨ Features

- 🔐 **Authentication** — Register / Login with JWT, bcrypt password hashing, auto-expiry tokens
- 👤 **Role-based access** — Admin vs Volunteer roles, admin-only routes
- 📋 **Multi-step registration** — 3-step volunteer form with validation
- 👥 **Volunteer management** — CRUD, search, filter by status, view profiles
- 📅 **Events** — Create/manage volunteer events with fill-rate tracking
- 🛡️ **Admin dashboard** — Approve/reject volunteers, admin tools
- 📊 **Reports** — Volunteer summary, skills breakdown, event participation, monthly trends
- 📥 **CSV export** — Download all volunteer data
- 📈 **Live stats** — MongoDB aggregation pipeline for charts and metrics

---

## 🚀 Quick Start

### 1. Clone / Download the project

```bash
git clone <your-repo-url>
cd volunteerhub
```

### 2. Set up MongoDB Atlas (free)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and sign up
2. Create a free **M0 cluster** (Shared, Free Forever)
3. Create a **database user** (username + password — save these!)
4. Under **Network Access**, add `0.0.0.0/0` to allow all IPs
5. Click **Connect → Drivers** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```

### 3. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/volunteerhub?retryWrites=true&w=majority
JWT_SECRET=generate_a_long_random_string_here
JWT_EXPIRES_IN=7d
PORT=5000
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Install dependencies & seed database

```bash
cd backend
npm install
npm run seed        # Creates admin user + sample volunteers + events
```

Seed creates:
- **Admin account:** `admin@volunteerhub.org` / `admin123`
- 6 sample volunteers (mix of Active/Pending/Inactive)
- 4 sample events

### 5. Start the backend

```bash
npm run dev         # Development (auto-reload with nodemon)
# or
npm start           # Production
```

Server starts at: `http://localhost:5000`

### 6. Open the frontend

Open `frontend/index.html` in your browser directly — **no build step needed**.

> If you're on VS Code, use the **Live Server** extension for best results.

---

## 📁 Project Structure

```
volunteerhub/
├── backend/
│   ├── models/
│   │   ├── User.js          # Auth user model (admin / volunteer)
│   │   ├── Volunteer.js     # Volunteer registration model
│   │   └── Event.js         # Events model
│   ├── routes/
│   │   ├── auth.js          # POST /register, /login, GET /me
│   │   ├── volunteers.js    # CRUD + stats + status management
│   │   └── events.js        # Event CRUD
│   ├── middleware/
│   │   └── auth.js          # protect (JWT verify) + adminOnly
│   ├── server.js            # Express app entry point
│   ├── seed.js              # Database seed script
│   └── .env.example         # Environment variable template
└── frontend/
    ├── index.html           # Complete single-page application
    └── api.js               # API client module (reference)
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint                  | Auth     | Description              |
|--------|---------------------------|----------|--------------------------|
| POST   | `/api/auth/register`      | None     | Create account           |
| POST   | `/api/auth/login`         | None     | Login, get JWT           |
| GET    | `/api/auth/me`            | Bearer   | Get current user         |
| POST   | `/api/auth/change-password` | Bearer | Change password          |

### Volunteers
| Method | Endpoint                        | Auth         | Description              |
|--------|---------------------------------|--------------|--------------------------|
| GET    | `/api/volunteers`               | Bearer       | List (search, filter)    |
| GET    | `/api/volunteers/stats`         | Admin        | Dashboard stats          |
| POST   | `/api/volunteers`               | Bearer       | Register volunteer       |
| GET    | `/api/volunteers/:id`           | Bearer       | Get one volunteer        |
| PATCH  | `/api/volunteers/:id`           | Bearer       | Update volunteer         |
| PATCH  | `/api/volunteers/:id/status`    | Admin        | Approve/reject           |
| DELETE | `/api/volunteers/:id`           | Admin        | Delete volunteer         |

### Events
| Method | Endpoint         | Auth   | Description    |
|--------|------------------|--------|----------------|
| GET    | `/api/events`    | Bearer | List events    |
| POST   | `/api/events`    | Admin  | Create event   |
| PATCH  | `/api/events/:id`| Admin  | Update event   |
| DELETE | `/api/events/:id`| Admin  | Delete event   |

---

## 🌐 Deployment

### Backend → Render (free)
1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo, set **Root Directory** to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables from your `.env`

### Frontend → Netlify (free)
1. Go to [netlify.com](https://netlify.com) → Add new site → Deploy manually
2. Drag and drop the `frontend/` folder
3. Update `BASE` URL in `index.html` to your Render backend URL

---

## 🔒 Security Features

- Passwords hashed with **bcrypt (12 rounds)**
- JWT tokens expire in **7 days**
- Route protection via `Authorization: Bearer <token>` header
- Input validation on all POST/PATCH routes
- Admin-only routes for sensitive operations
- CORS configured to allow only trusted origins

---

## 👤 Default Admin Account (after seeding)

```
Email:    admin@volunteerhub.org
Password: admin123
Role:     Administrator
```

> ⚠️ Change this password immediately in production!
