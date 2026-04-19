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
[cite_start]To design and build an AI-powered workflow system where Z.AI's GLM (General Language Model) acts as the central reasoning engine to transform fragmented recruitment workflows into an intelligent, automated process[cite: 5]. 

FutureJobSenpai is a stateful, adaptive workflow engine that dynamically bridges the gap between unstructured student profiles and strict corporate job requirements, facilitating end-to-end automation from resume parsing to interview scheduling.

### How We Address the Pain Points:
* **Application Tracker & Transparency:** A clear, milestone-driven dashboard so candidates always know their status.
* **"One-Click" Universal Profile:** An AI-powered structured profile that eliminates redundant manual data entry.
* **Verified & Transparent Listings:** Enforcing salary ranges, expiration dates, and company responsiveness scores.
* **Smart, Contextual AI Matching:** Moving beyond rigid keywords to match candidates based on true potential and skills.
* **Direct Connections:** Allowing qualified candidates to bypass standard filters and connect directly with hiring managers.

## 👥 Target Audience
* **Students / Job Seekers:** Individuals looking to generate professional profiles and find highly matched career opportunities.
* **Companies (By Invitation):** Organizations looking to streamline administrative HR approvals and intelligently filter incoming applicants.

## ✨ Core Features (The Agentic Workflow)
Our system relies entirely on the GLM to orchestrate the following dynamic processes. If the GLM component is removed, the system will lose its ability to coordinate and execute the workflow effectively.

### 🧑‍🎓 Student View
* **Unstructured Profile Building:** Students input messy, unformatted text. The GLM parses this into a structured, optimized JSON resume.
* **Proactive Ambiguity Resolution:** If a student's input is missing crucial context (e.g., listing "React" without specifying years of experience), the GLM pauses the workflow to ask clarifying questions before generating the profile.
* **AI Match Engine (AI Model A):** Recommends perfectly matched companies and provides a calculated match percentage.
* **Actionable Feedback Loop:** If rejected, the GLM analyzes the company's rejection reason alongside the student's resume to generate a personalized "Skill Quest" roadmap for improvement.
* **Stateful Evaluator (Mock Interviews):** An AI-assisted chat session that acts as a proxy interviewer based on specific job requirements, dynamically updating the student's hidden skill matrix.

### 🏢 Company View
* **Natural Language Job Posting:** Companies provide unstructured conversational details about their expectations and company culture.
* **Intelligent Applicant Filtering (AI Model B):** A high-density dashboard that filters incoming resumes based on the GLM's calculated rating system and provides a clear reasoning trace for the score.
* **Agentic Tool Orchestration:** Upon approving a resume, the system automatically cross-references schedules and manages small meeting setups with the student.
* **Automated Rejection Handling:** Generates and dispatches constructive feedback letters to applicants when a company rejects their profile.

## 🛠️ Tech Stack & System Architecture
* **Framework:** Next.js (App Router), TypeScript (Web Based App)
* **Frontend UI:** Tailwind CSS (Vibe Coding for high-density, industrial-tech data grids)
* **Backend / API:** Next.js Serverless Functions (Vibe Coding API Webhooks)
* **Database:** PostgreSQL (to store structured entity data)
* **Authentication:** Firebase (Handling role-based access control)
* **AI Orchestration Engine:** Z.AI GLM / Gemini API (The core reasoning engine)

## 🔄 System Flow
We utilize a streamlined user experience flow, strictly utilizing role-based registration.

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
| **Person 1** | **Core Setup & Infrastructure**<br>• Next.js setup (Middleware)<br>• Database & Auth: Prisma -> PostgreSQL, Firebase (Email/Google Login)<br>• AI Engine (Implementation of the AI rating system)<br>• Admin Dashboard<br>• Deployment |
| **Person 2** | **Student Experience (UI & Backend)**<br>• Student Dashboard (Displaying resume, AI rating, status, etc.)<br>• Resume generating logic<br>• Status Tracker (Tracking approved or rejected applications)<br>• Job preference view |
| **Person 3** | **Company Experience (UI & Backend)**<br>• Company View & Dashboard<br>• UI for showing expectations<br>• Chat Platform integration<br>• Notification system (Automated rejection alerts)<br>• Interview Session management |

---

## Firebase Setup (Next.js)

1. Copy environment template:

```bash
cp .env.example .env.local
```

2. Fill `.env.local` with your Firebase Web App config values.

3. Reuse the shared Firebase client module in client components:

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

4. Never hardcode Firebase config directly inside pages/components.

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
