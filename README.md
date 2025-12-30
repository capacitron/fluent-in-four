# Fluent in Four

A mobile-first, gamified language learning Progressive Web App for Romance languages (Spanish, French, Italian, Portuguese).

## Features

- **5-Task Learning Methodology**
  1. Listen & Read - Listen to audio while reading sentences
  2. Shadowing - Listen, pause, repeat aloud with voice recording
  3. Scriptorium - Type each sentence while speaking aloud
  4. Translation Written - See English, type target language
  5. Translation Verbal - See English, record yourself speaking

- **Gamification**
  - XP and leveling system (20 levels)
  - Daily streaks with freeze protection
  - 20+ achievements to unlock
  - Global and friends leaderboards

- **PWA Features**
  - Installable on mobile/desktop
  - Offline support with background sync
  - Push notifications (coming soon)

- **Modern Design**
  - Neo-Mediterranean aesthetic
  - Dark/light theme toggle
  - Mobile-first responsive design
  - Smooth animations with Framer Motion

## Tech Stack

```
Frontend:  React 18 + TypeScript + Vite + Tailwind CSS
State:     Zustand (with persistence)
Audio:     Howler.js
Recording: MediaRecorder API
Backend:   Express.js + TypeScript
Database:  PostgreSQL + Drizzle ORM
Auth:      JWT + Passport.js
PWA:       vite-plugin-pwa + Workbox
```

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd fluent-in-four
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/fluent_in_four
JWT_SECRET=your-32-char-minimum-secret-key
JWT_REFRESH_SECRET=your-32-char-minimum-refresh-secret

# Optional
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password
```

Generate secure keys:
```bash
openssl rand -base64 32
```

### 3. Database Setup

```bash
# Create database
createdb fluent_in_four

# Run migrations
npm run db:migrate

# Seed initial data (languages, lessons, sentences)
npm run db:seed
```

### 4. Start Development

```bash
# Start both client and server
npm run dev

# Or separately:
npm run dev:server  # http://localhost:3000
npm run dev:client  # http://localhost:5173
```

## Project Structure

```
fluent-in-four/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   ├── stores/        # Zustand stores
│   │   ├── services/      # API services
│   │   └── hooks/         # Custom hooks
│   └── public/            # Static assets
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── db/            # Database schema & migrations
│   └── drizzle/           # Migration files
└── shared/                 # Shared types
```

## Available Scripts

### Root
- `npm run dev` - Start full development environment
- `npm run build` - Build for production
- `npm run start` - Start production server

### Server
- `npm run dev:server` - Start server with hot reload
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Drizzle Studio

### Client
- `npm run dev:client` - Start Vite dev server
- `npm run build:client` - Build client for production
- `npm run preview` - Preview production build

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Languages & Lessons
- `GET /api/languages` - List all languages
- `GET /api/lessons/:languageCode` - List lessons for language
- `GET /api/lessons/:id` - Get lesson details with sentences

### Progress
- `GET /api/progress` - Get user progress summary
- `POST /api/progress/lessons/:id` - Update lesson progress
- `POST /api/progress/lessons/:id/tasks/:task` - Update task progress

### Gamification
- `GET /api/gamification/streak` - Get current streak
- `GET /api/gamification/achievements` - Get achievements
- `GET /api/gamification/leaderboard` - Get leaderboard

### Admin (requires admin role)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users/:id` - Update user
- `POST /api/admin/lessons` - Create lesson
- `POST /api/admin/sentences` - Bulk create sentences

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `JWT_SECRET` | Yes | - | Access token secret (32+ chars) |
| `JWT_REFRESH_SECRET` | Yes | - | Refresh token secret (32+ chars) |
| `JWT_ACCESS_EXPIRES` | No | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES` | No | `30d` | Refresh token lifetime |
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `3000` | Server port |
| `CLIENT_URL` | No | `http://localhost:5173` | Frontend URL |
| `ADMIN_EMAIL` | No | - | Initial admin email |
| `ADMIN_PASSWORD` | No | - | Initial admin password |

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Replit Deployment

1. Create new Replit project (Node.js 20)
2. Upload code or connect to Git
3. Add PostgreSQL database
4. Configure Secrets (environment variables)
5. Upload audio files to Object Storage
6. Run: `npm run db:migrate && npm run db:seed`
7. Deploy

### Docker (Coming Soon)

```bash
docker-compose up -d
```

## Testing

### Manual Test Checklist

- [ ] User registration with email/password
- [ ] User login and logout
- [ ] Select language and view lessons
- [ ] Complete all 5 tasks in a lesson
- [ ] Verify XP and level progression
- [ ] Verify streak updates
- [ ] Unlock achievements
- [ ] Check leaderboard rankings
- [ ] Test offline mode
- [ ] Test PWA installation
- [ ] Admin panel access and functions

## Security Features

- JWT-based authentication with refresh tokens
- HTTP-only cookies for refresh tokens
- Password hashing with bcrypt
- Protected admin routes
- CORS configuration
- Input validation with Zod

## License

MIT

## Credits

Built with the help of Claude Code.
