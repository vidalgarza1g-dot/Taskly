# Taskly — Apple Launch Guide

Everything needed to take Taskly from "enrolled in the Apple Developer Program" to "live on the App Store." Do these **in order**. Items marked **(blocker)** will get the app rejected if skipped.

Key facts you'll reuse:
- **Bundle ID:** `com.taskly.app`
- **Apple Pay merchant ID:** `merchant.com.taskly.app`
- **Firebase project:** `servicio-e7824`
- **Backend:** Railway (live Stripe keys already set)
- **App name:** Taskly

---

## 0. Enroll (you, only you)
- Apple Developer Program, **Individual**, $99/yr — via the "Apple Developer" iPhone app.
- Wait for "Welcome to the Apple Developer Program" email.

---

## 1. App ID + capabilities — developer.apple.com → Certificates, IDs & Profiles
1. **Identifiers → +** → App IDs → App → Description "Taskly", Bundle ID **explicit** `com.taskly.app`.
2. Enable capabilities:
   - ☑ **Sign in with Apple** *(blocker — see §3)*
   - ☑ **Push Notifications**
   - ☑ **Apple Pay Payment Processing**
3. Register.

---

## 2. Sign in with Apple → Firebase **(blocker)**
> Required because Taskly offers Google login — Apple Guideline 4.8 mandates Sign in with Apple alongside it. This is what's currently throwing the error on the login screen.

In the Apple Developer portal:
1. **Keys → +** → name "Taskly Sign in with Apple", enable **Sign in with Apple**, Configure → primary App ID `com.taskly.app` → Continue → Register → **Download the `.p8`** (one-time download — keep it safe).
2. Note your **Key ID** (on the key) and **Team ID** (top-right of the portal).
3. **Identifiers → + → Services IDs** → name "Taskly Web", identifier e.g. `com.taskly.app.signin` → enable Sign in with Apple → Configure:
   - Primary App ID: `com.taskly.app`
   - Domains: `servicio-e7824.firebaseapp.com`
   - Return URL: `https://servicio-e7824.firebaseapp.com/__/auth/handler`

In **Firebase Console → Authentication → Sign-in method → Apple → Enable**:
- **Services ID:** `com.taskly.app.signin`
- **Apple Team ID:** (from step 2)
- **Key ID:** (from step 2)
- **Private key:** paste contents of the `.p8`
- Save.

✅ App-side is already done: `ios.usesAppleSignIn: true` is set in `app.json`, and the sign-in code is correct. Once Firebase's Apple provider is saved, the login error disappears in the next build.

---

## 3. Push notifications (APNs)
- The app already gets a real Expo push token. For iOS you need the APNs key so Expo can deliver:
  1. Apple portal → **Keys → +** → enable **Apple Push Notifications service (APNs)** → Register → download `.p8`.
  2. Upload it to Expo: `eas credentials` (iOS → Push Notifications → upload the APNs key), or let `eas build` prompt you.

---

## 4. Apple Pay
- Apple portal → **Identifiers → Merchant IDs → +** → `merchant.com.taskly.app`.
- Create a **Apple Pay Payment Processing Certificate** for it (Stripe gives you a CSR: Stripe Dashboard → Settings → Payments → Apple Pay → add the merchant ID, download CSR, upload to Apple, upload the resulting cert back to Stripe).
- `app.json` already declares `merchant.com.taskly.app`.
- *Apple Pay is not a launch blocker — card payments work without it. Can be a fast-follow.*

---

## 5. EAS build (Expo) — link project + build
```bash
npx eas-cli login
npx eas-cli init        # creates the EAS project, fills extra.eas.projectId
# iOS build for TestFlight:
npx eas-cli build --profile production --platform ios
npx eas-cli submit --profile production --platform ios
```
- EAS will create/manage the distribution cert + provisioning profile for you (let it).
- First `submit` uploads to **App Store Connect → TestFlight**.

> Tip: do a **free Android build first** to test payments + push end-to-end without waiting on Apple: `npx eas-cli build --profile development --platform android`.

---

## 6. App Store Connect — app record
appstoreconnect.apple.com → **Apps → +**
- Platform iOS, name **Taskly**, primary language **Spanish (Mexico)**, bundle ID `com.taskly.app`, SKU `taskly-001`.

### 6a. App Privacy "nutrition label" **(blocker)**
App Store Connect → your app → **App Privacy**. Declare what Taskly collects (be honest — mismatches cause rejection):
- **Contact Info:** email, name → linked to identity.
- **Location:** precise location (for service address) → linked.
- **User Content:** photos/videos (job photos), messages (chat).
- **Financial Info:** payment info handled by **Stripe** (you don't store cards).
- **Identifiers:** user ID, device/push token.
- **Usage/Diagnostics:** if Sentry/Analytics enabled.
- Mark whether each is used for **App Functionality** (yes) vs Tracking (no — you don't track across apps).

### 6b. Account deletion **(blocker — present, see repo note)**
- The app already has Configuración → Eliminar cuenta. ⚠️ See "Account deletion hardening" below — recommend the backend cascade before launch.

### 6c. Listing assets
- **Screenshots:** required **6.7"** (iPhone 15/16 Pro Max) — at least 3; 6.5" optional. Generate from a TestFlight build or simulator.
- **Icon:** 1024×1024 (no alpha) — from the approved Taskly logo.
- **Description, subtitle, keywords, category** (Business or Lifestyle), **support URL** `https://taskly.com.mx/contacto`, **privacy policy URL** `https://taskly.com.mx/privacidad`.
- **Age rating** questionnaire.

### 6d. Reviewer notes **(blocker)**
In "App Review Information → Notes", include:
- A working **client** demo login (email + password).
- A working **worker** demo login (with a Stripe test/connected account so they can see the payout flow).
- A line: *"Payments are for in-person physical home services (plumbing, cleaning, etc.) fulfilled outside the app, processed via Stripe. Per Guideline 3.1.3(e)/3.1.5, In-App Purchase does not apply."*
- Note that location is requested only to share the service address with the assigned worker.

---

## 7. Submit
- Attach the TestFlight build to the version, fill "What's New", submit for review.
- Typical review: 24–48h. Expect possible questions about payments — the reviewer note above pre-empts the common one.

---

## Pre-submit checklist (quick)
- [ ] Enrolled (Individual)
- [ ] App ID + capabilities (Sign in with Apple, Push, Apple Pay)
- [ ] **Firebase Apple provider configured** → Apple login works (blocker)
- [ ] APNs key uploaded to Expo
- [ ] EAS project linked, iOS build on TestFlight
- [ ] App Privacy nutrition label filled (blocker)
- [ ] Account deletion verified to purge data
- [ ] Screenshots (6.7"), icon 1024, description, category, age rating
- [ ] Privacy + Support URLs set
- [ ] Demo client + worker logins in reviewer notes (blocker)
- [ ] Reviewer note re: physical services / no IAP (blocker)
- [ ] One live end-to-end payment confirmed with the new job-labeling

---

## Account deletion hardening (recommended before launch)
Current `handleDeleteAccount` (App.js ~6047) deletes the `users/{uid}` doc + the Firebase Auth user. That **passes Apple's baseline** (the account is removed in-app), but it leaves orphaned data: the user's jobs, notifications, chats/messages, ratings, businesses, and the job `private/location` subdocs. Firestore rules block a full client-side cascade (ratings/clientRatings are admin-delete-only).

**Robust fix:** a backend `POST /delete-account` (admin SDK) that — using the uid from the verified ID token — cascade-deletes the user's Firestore data and calls `adminAuth.deleteUser(uid)` (admin delete bypasses the "requires recent login" error too). The app then calls it via `authedFetch` and signs out. This is the clean, GDPR-friendly path. *Not a hard launch blocker, but worth doing.*
