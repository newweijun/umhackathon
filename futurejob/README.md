# FutureJobSenpai (LinkedFuture) 🚀

**Domain:** AI Systems & Agentic Workflow Automation

## 📌 Problem Statement
Currently, the employment and recruitment sector relies on fragmented, manual, and unstructured workflows. Standard job boards act as static databases. They do not actively facilitate multi-step reasoning, handle ambiguous candidate data, or orchestrate the complex matchmaking logic required to connect the right talent with the right opportunity.

Our research highlights **critical pain points** in existing platforms:
1. **The "Application Black Hole":** Candidates suffer from ghosting, opaque hiring timelines, and fake "ghost jobs."
2. **Redundant Processes:** Users are forced into repetitive data entry and encounter broken automated resume parsing.
3. **ATS Flaws:** Qualified candidates are often rejected by cold, impersonal algorithms for minor keyword mismatches.
4. **Search Challenges:** Information overload, irrelevant search results, and vague listings with missing salary or location data.
5. **Systematic Barriers:** "Easy apply" features lead to massive applicant pools, removing genuine human connection from the hiring process.

## 🎯 Objective
Build a production-ready, role-based recruitment platform on Next.js + Firebase that supports:

1. Reliable authentication and route protection.
2. Structured job, application, interview, message, and notification flows.
3. A clean service layer for Firestore queries and workflow actions.
4. AI-ready integration points that can be upgraded from mock logic to real model orchestration.

FutureJobSenpai currently ships a Firebase-first MVP with real data flows for core recruitment operations, while AI orchestration remains partially mocked and staged for the next iteration.

### How We Address the Pain Points:
* **Application Tracker & Transparency:** A clear, milestone-driven dashboard so candidates always know their status.
* **"One-Click" Universal Profile:** An AI-powered structured profile that eliminates redundant manual data entry.
* **Verified & Transparent Listings:** Enforcing salary ranges, expiration dates, and company responsiveness scores.
* **Smart, Contextual AI Matching:** Moving beyond rigid keywords to match candidates based on true potential and skills.
* **Direct Connections:** Allowing qualified candidates to bypass standard filters and connect directly with hiring managers.

## 👥 Target Audience
* **Students / Job Seekers:** Individuals looking to generate professional profiles and find highly matched career opportunities.
* **Companies (By Invitation):** Organizations looking to streamline administrative HR approvals and intelligently filter incoming applicants.

## ✨ Core Features (Current MVP + AI Roadmap)

### ✅ Implemented in Current Codebase

#### 🧑‍🎓 Student View
* **Application Tracker:** Student dashboard reads real applications from Firestore and maps status to UI states.
* **Resume Lab:** Resume builder and resume history persistence are connected to Firestore.
* **Messaging UI:** Student message page supports real-time style chat flows through Firestore collections.
* **Job Match UI:** Match cards/details are implemented, currently powered by seeded/mock ranking data.

#### 🏢 Company View
* **Job Posting Workflow:** Company can create and manage job listings.
* **Candidate Review Flow:** Candidate listing and application status updates are wired to service layer functions.
* **Interview Scheduling:** Interview creation and status updates are backed by Firestore.
* **Company Messaging + Notification Hooks:** Messaging and notification services are available and reusable.

#### 🛡️ Admin View
* **Admin Dashboard:** Server-side aggregated metrics (users/jobs/applications/ratings/audit logs) are rendered from Firestore.
* **Role Claim Sync:** API route synchronizes Firestore role to Firebase custom claims for access control.

#### ⚙️ Platform Foundation
* **Route Protection:** `proxy.ts` validates JWT and role-based path access for protected routes.
* **Service Layer:** Query and workflow functions are centralized under `lib/services`.
* **Firebase Rules + Emulator Tests:** Firestore/Storage rules and unit tests are included.

### 🧠 Planned / In Progress (Not Fully Implemented Yet)
* **GLM/Gemini-driven profile parsing from unstructured input**
* **Clarifying-question loop for ambiguous candidate input**
* **Model-based bidirectional match scoring and reasoning trace generation**
* **Automated skill-gap feedback generation on rejection ("Skill Quest")**
* **Stateful AI interviewer flow with adaptive evaluation updates**

## 🛠️ Tech Stack & System Architecture
* **Framework:** Next.js (App Router), TypeScript (Web Based App)
* **Frontend UI:** Tailwind CSS (Vibe Coding for high-density, industrial-tech data grids)
* **Backend / API:** Next.js Route Handlers + Service Layer modules
* **Primary Data Store:** Firebase Cloud Firestore
* **Authentication & Authorization:** Firebase Auth + Custom Claims + route guard in `proxy.ts`
* **Storage:** Firebase Storage (rules and tests included; optional for Spark setup)
* **Admin Data Access:** Firebase Admin SDK (`lib/firebase/admin.ts`)
* **AI Orchestration:** Planned integration (current MVP uses mock/heuristic placeholders in selected screens)

## 🔄 System Flow
Current implementation flow (MVP):

1. **Authentication:** User signs up/signs in (Email/Password or Google) and selects role.
2. **Claims Sync:** `/api/auth/sync-claims` syncs Firestore role to Firebase custom claims.
3. **Route Guard:** Protected routes validate token + role via `proxy.ts`.
4. **Student Operations:** Student views applications, resume records, matches (currently mocked), and messages.
5. **Company Operations:** Company posts jobs, manages applications, schedules interviews, and uses messaging UI.
6. **Admin Operations:** Admin dashboard reads aggregate operational metrics directly from Firestore.

Target flow extension (roadmap):

1. **AI parsing + clarification loop** for profile and requirement structuring.
2. **Model-generated matching + reasoning traces** for recruiter and student dashboards.
3. **Automated feedback generation** for rejected applications.
4. **AI-assisted interview evaluation loop** with stateful score updates.

Legacy concept flow (kept for roadmap reference):

1. **Authentication:** User signs up and is immediately prompted to choose their role (Student or Company).
2. **Student Flow:**
   * Create profile (AI parses raw text into a structured resume).
   * Choose job preferences (Location, salary, position).
   * AI orchestrates matching and sends the application.
   * *Edge Case 1 (Approval):* System orchestrates an interview session and opens the built-in chat platform.
   * *Edge Case 2 (Rejection):* AI generates actionable feedback and improvement suggestions.
3. **Company Flow:**
   * Provide unstructured company details and expectations.
   * AI structures the requirements and filters incoming resumes with match percentages.
   * Company reviews GLM reasoning trace and approves/rejects.

## 💼 Business Model
* **Freemium Model:** Users are granted 3 "Agentic Workflow Tokens" (actions) per account.
* **Pro Subscription:** Unlocks unlimited AI orchestration, unrestricted resume generation, and unlimited interview setups.

## 🚀 Task Distribution (Hackathon Execution Plan)

| Team Member | Responsibilities |
| :--- | :--- |
| **Person 1** | **Core Setup & Infrastructure**<br>• Next.js setup + route guard (`proxy.ts`)<br>• Firebase Auth + Firestore + Admin SDK integration<br>• Service layer foundations (`lib/services/*`)<br>• Admin Dashboard<br>• Deployment / CI |
| **Person 2** | **Student Experience (UI & Backend)**<br>• Student Dashboard (Displaying resume, AI rating, status, etc.)<br>• Resume generating logic<br>• Status Tracker (Tracking approved or rejected applications)<br>• Job preference view |
| **Person 3** | **Company Experience (UI & Backend)**<br>• Company View & Dashboard<br>• UI for showing expectations<br>• Chat Platform integration<br>• Notification system (Automated rejection alerts)<br>• Interview Session management |

---

## Firebase Setup (Next.js)

1. Create `.env.local` in project root and fill Firebase Web App config values:

```bash
# Firebase Web SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

2. Reuse the shared Firebase client module in client components:

```ts
import {
   firebaseApp,
   firebaseAuth,
   firebaseDb,
   firebaseStorage,
   getFirebaseAnalytics,
} from "@/lib/firebase/client";

// Optional analytics on client side only
getFirebaseAnalytics();
```

3. Never hardcode Firebase config directly inside pages/components.

## Spark Plan Note

If your Firebase project is on Spark and Storage is not enabled, use Firestore-only commands by default:

```bash
npm run test:rules
npm run firebase:deploy:rules
```

Optional (only after Storage is enabled in Firebase Console):

```bash
npm run test:rules:all
npm run firebase:deploy:rules:all
```

## CI for Firebase Rules (GitHub Actions)

Workflow file:

- `.github/workflows/firebase-rules-ci.yml`

Behavior:

1. On pull request: run `npm run test:rules` (Firestore emulator tests).
2. On push to `main`: deploy Firestore rules automatically.
3. Optional: deploy Storage rules only when repository variable `ENABLE_STORAGE_RULES=true`.

Required GitHub repository secret:

- `FIREBASE_SERVICE_ACCOUNT_JSON`: full JSON of a Firebase service account key with permissions to deploy rules.

Recommended for Spark projects (no Storage enabled yet):

- Do not set `ENABLE_STORAGE_RULES`, or keep it as `false`.

## Firestore Query Service Layer

Service entry:

- `lib/services/index.ts`

Implemented query services:

- `lib/services/jobs.ts`
- `lib/services/applications.ts`
- `lib/services/candidateProfiles.ts`
- `lib/services/companyProfile.ts`
- `lib/services/interviews.ts`
- `lib/services/messages.ts`
- `lib/services/notifications.ts`
- `lib/services/ratingResults.ts`
- `lib/services/workflows.ts`
- `lib/services/timestamps.ts`

Index-to-query alignment:

1. `jobs: companyId + status + createdAt(desc)`
   - `getCompanyJobsByStatus(companyId, status, take)`
2. `jobs: status + createdAt(desc)`
   - `getJobsByStatus(status, take)`
3. `applications: studentId + status + createdAt(desc)`
   - `getStudentApplicationsByStatus(studentId, status, take)`
4. `applications: companyId + status + createdAt(desc)`
   - `getCompanyApplicationsByStatus(companyId, status, take)`
5. `applications: jobId + status + createdAt(desc)`
   - `getJobApplicationsByStatus(jobId, status, take)`
6. `applications: companyId + jobId + createdAt(desc)`
   - `getCompanyApplicationsByJob(companyId, jobId, take)`
7. `ratingResults: companyId + createdAt(desc)`
   - `getCompanyRatingResults(companyId, take)`

## Admin Setup

You can enable an admin account in three ways:

1. Manual Firestore mark
   - Open `users/{uid}` in Firestore and set `role` to `admin`.
   - Then call the login flow once so custom claims sync from Firestore.

2. Local/server bootstrap script
   - Script: `scripts/admin-bootstrap.js`
   - Run:

```bash
npm run admin:bootstrap -- <uid> [email]
```

   - Required env vars:
     - `FIREBASE_ADMIN_PROJECT_ID`
     - `FIREBASE_ADMIN_CLIENT_EMAIL`
     - `FIREBASE_ADMIN_PRIVATE_KEY`

3. Hidden local admin entry
   - Open `/login?admin=1` on `localhost` during development.
   - This reveals an extra `Admin Mode` button only in local/dev.
   - It is not shown in production.
