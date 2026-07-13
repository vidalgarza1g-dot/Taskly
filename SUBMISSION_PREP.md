# Taskly — App Store Submission Prep (copy-paste ready)

Fill the `[ ]` blanks (demo logins) when you have them. Everything else is ready to paste into App Store Connect.

---

## A. App Review notes (paste into "App Review Information → Notes")

```
Taskly is a marketplace that connects clients with independent home-service
workers (plumbing, cleaning, electrical, painting, carpentry, A/C) in
Monterrey, Mexico.

DEMO ACCOUNTS
- Client:  [email]  /  [password]
- Worker:  [email]  /  [password]   (has a Stripe Connect test account so you
  can see the full quote → accept → payment flow)

  ⚠️ IMPORTANT: the demo accounts MUST have verified emails (or use Google/Apple
  sign-in). In production builds the dev-only email-verification bypass is OFF, so
  an unverified email/password demo account cannot log in and App Review will fail.

PAYMENTS / NO IN-APP PURCHASE
All payments are for physical, in-person services performed at the client's
home, processed via Stripe. There are no digital goods, subscriptions, or
in-app content unlocks, so In-App Purchase does not apply (Guidelines
3.1.3(e) and 3.1.5). The app itself is free.

LOCATION
Precise location is requested only so a client can share their home address
with the assigned worker in order to perform the service. It is not used for
tracking or advertising.

SIGN IN WITH APPLE
Offered alongside Google sign-in, per Guideline 4.8.

ACCOUNT DELETION
Available in-app under Configuración → Eliminar cuenta (Guideline 5.1.1(v)).
It deletes the account and all associated data server-side.

IDENTITY VERIFICATION
Workers may verify identity by submitting a photo of their INE (national ID)
plus a live selfie; reviewed by Taskly staff. Consent + purpose are disclosed
in the privacy policy (taskly.com.mx/privacidad).
```

---

## B. App Privacy "nutrition label" answers (App Store Connect → App Privacy)

For **each** type below: purpose = **App Functionality** (and Analytics only where noted). **Linked to identity = Yes.** **Used for tracking = NO** for everything (Taskly does not track users across other companies' apps/sites).

| Category | Data type | Notes |
|---|---|---|
| Contact Info | Name, Email, Phone number | Account + profile |
| Location | Precise Location | Share home address with assigned worker |
| Financial Info | Payment Info | Collected by the **Stripe** SDK; Taskly does not store card numbers |
| User Content | Photos or Videos | Job photos/videos, chat media |
| User Content | Other User Content (messages) | In-app chat |
| Sensitive Info | Government ID + biometric (INE photo + selfie) | Worker identity verification, with consent |
| Identifiers | User ID, Device ID / push token | Account + push notifications |
| Diagnostics | Crash Data, Performance Data | Sentry (if enabled in the build) |

> When Apple asks "Is this data used to track you?" answer **No** for all.
> When it asks "Is this data linked to the user's identity?" answer **Yes** for all above.

---

## C. Listing metadata (draft — edit to taste)

- **Name:** Taskly
- **Subtitle (≤30 chars):** Servicios a domicilio confiables
- **Primary category:** Business  ·  **Secondary:** Lifestyle
- **Keywords (≤100 chars):** plomero,electricista,limpieza,pintura,servicios,hogar,domicilio,trabajador,reparación,Monterrey
- **Support URL:** https://taskly.com.mx/contacto
- **Privacy Policy URL:** https://taskly.com.mx/privacidad
- **Marketing URL (optional):** https://taskly.com.mx

**Description (Spanish):**
```
Taskly conecta a personas que necesitan servicios a domicilio con
trabajadores independientes verificados en Monterrey y su área metropolitana.

• Publica lo que necesitas (plomería, electricidad, limpieza, pintura,
  carpintería, aire acondicionado) con fotos.
• Recibe estimados de trabajadores y acuerda el precio por chat.
• Paga de forma segura con tarjeta (procesado por Stripe) o en efectivo.
• Trabajadores con identidad verificada (INE) y calificaciones reales.

Taskly es una plataforma de conexión: los trabajadores son prestadores de
servicios independientes.
```

---

## D. Screenshots (required: 6.7" iPhone — 1290×2796)

Capture 3–5 from a TestFlight or dev build, consistent theme:
1. **Explorar** — directory of workers/companies (trust: ratings + verified badge)
2. **Publicar trabajo** — the post form
3. **Chat + cotización** — worker's quote card / "Aceptar y contratar"
4. **Desglose de pago** — the payment breakdown (shows transparency)
5. **Perfil verificado** — a worker profile with ratings + "Verificado"

(6.5" is optional; 6.7" covers modern iPhones.)

---

## E. Pre-submit gate (must be true)
- [ ] Sign in with Apple works (Firebase Apple provider configured)
- [ ] App Privacy answers filled (section B)
- [ ] Account deletion verified to delete data
- [ ] Demo client + worker logins in the review note (section A)
- [ ] Screenshots (6.7") + 1024 icon uploaded
- [ ] Age rating questionnaire completed
- [ ] One live payment confirmed with the new fee split
