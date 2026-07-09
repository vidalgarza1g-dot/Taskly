# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start the development server
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android

# Install a new Expo-compatible package
npx expo install <package-name>

# Install a regular npm package
npm install <package-name>
```

There are no tests configured in this project.

## Architecture

Taskly is a React Native / Expo app for hiring home-service workers (plumbing, electrical, cleaning, etc.) in the Monterrey, Mexico area. The entire app lives in a single file: **`App.js`**.

### State machine (auth flow)

The root `App` component drives a top-level state machine via `screen` state:
- `role-selection` → user picks Client or Worker
- `login` → email/password auth via Firebase Auth
- `home` → authenticated main view

Once authenticated, the active tab (`activeTab`) switches between views:
- **Client:** `feed` (browse open jobs) | `my-jobs` (own posts) | `workers` (directory) | `notifications`
- **Worker:** `feed` (browse jobs to bid on) | `my-bids` (bids submitted) | `notifications`

### Component hierarchy

All screens are modals layered on top of the tab views:
- `PostJobScreen` — create/edit a job posting
- `JobDetailModal` — view a job; bid (worker) or manage bids/accept/complete (client)
  - `ChatScreen` — in-job messaging, accessed from JobDetailModal
  - `LocationPickerModal` — share exact address once job is assigned
  - `RatingModal` — rate worker (client) or client (worker) on completion
  - `ScheduleModal` — propose a visit time inside a chat
- `WorkerProfileModal` — view a worker's public ratings; workers can hide individual reviews
- `WorkersDirectoryScreen` — list all workers sorted by rating
- `ProfileScreen` — edit own name, bio, profile image
- `NotificationsScreen` — real-time notification list; tapping opens related job

### Firebase (Firestore) collections

| Collection | Purpose |
|---|---|
| `users` | User profiles: `role`, `name`, `bio`, `rating`, `jobCount`, `clientRating`, `profileImage`, `hiddenRatings[]` |
| `jobs` | Job postings: `status` (`open`/`assigned`/`completed`), `bids[]`, `assignedTo`, `exactLocation`, `locationShared`, `scheduledTime` |
| `notifications` | Per-user notifications; `read` flag, `jobId` for deep-link |
| `chats` | Chat rooms keyed by `participants[]` + `jobId` |
| `messages` | Chat messages; `type` field handles text vs `schedule_proposal`/`schedule_agreed` |
| `ratings` | Worker ratings (client → worker) |
| `clientRatings` | Client ratings (worker → client); only visible to other workers |

### Key constants (top of App.js)

- `COLORS` — full color palette (dark theme, accent `#FF6B35`)
- `SERVICES` — the 6 service categories (id, label, icon, color)
- `MONTERREY_LOCATIONS` — 6 preset area choices with lat/lng used for estimated location
- `URGENT_JOB_PRICE` — 25 MXN fee for promoted/urgent job listings
- `STRIPE_PUBLISHABLE_KEY` — placeholder; Stripe integration is scaffolded but simulated
- `GOOGLE_MAPS_API_KEY` — currently reuses the Firebase API key; map previews only render if a valid Maps Static API key is set

### Features that are scaffolded but not yet wired to real APIs

- **Image upload** (`uploadImage`) — simulated; production path uses Firebase Storage
- **Push notifications** (`setupPushNotifications`) — simulated; production uses `expo-notifications`
- **Image picker** (`ImagePickerButton`) — shows an Alert; production uses `expo-image-picker`
- **Device GPS** in `LocationPickerModal` — uses random offset from preset area; production uses `expo-location`
- **Stripe payments** (`PaymentModal`) — simulates a 2-second delay; production calls a backend `/create-payment-intent` endpoint

### Firestore indexes required

Queries that combine `where` + `orderBy` on different fields require composite indexes. These will throw an error in the console with a link to create the index in the Firebase console. Common ones needed:
- `notifications`: `userId` + `createdAt desc`
- `ratings`: `workerId` + `createdAt desc` and `workerId` + `rating desc`
- `messages`: `chatId` + `createdAt asc`
