# Project Context: FutureJobSenpai (LinkedFuture)

## 1. Project Overview
**Domain:** AI Systems & Agentic Workflow Automation (UMHackathon 2026)
**Core Concept:** A stateful, adaptive workflow engine utilizing Z.AI's GLM (General Language Model) as the central reasoning orchestrator. It transforms fragmented, unstructured recruitment processes into intelligent, automated career routing, bypassing traditional keyword-matching ATS systems.

## 2. Tech Stack & Environment
* **Framework:** Next.js (App Router) with TypeScript.
* **Frontend:** Tailwind CSS (Vibe Coding / Industrial-tech data grids).
* **Authentication:** Firebase Auth (Email/Password + Google).
* **Database:** Cloud Firestore (NoSQL).
* **Storage:** Firebase Storage (for resumes/assets).
* **AI Engine:** Z.AI GLM (Gemini API) configured for strict JSON output.
* **Backend Logic:** Next.js Route Handlers (BFF pattern), migrating heavy background tasks to Cloud Functions if required.

## 3. Architecture & Security Policies
* **Role Management:** Hybrid approach. Core roles (`STUDENT`, `COMPANY`, `ADMIN`) are managed via Firebase Custom Claims for fast client-side access and Next.js Middleware route protection, while detailed profile data lives in Firestore.
* **Company Verification Loop:** Companies register with `isVerified: false`. They are blocked via Next.js Middleware from writing to the `jobs` collection until an Admin manually toggles their status to `true`.
* **Data Strategy (NoSQL):** Data must be denormalized. Dashboard views should rely on embedded data (e.g., student name and match score inside the application document) to minimize complex client-side joins and read operations.
* **Agentic Orchestration Rules:** * The GLM is not a chatbot; it is a stateful orchestrator.
    * All GLM API calls must enforce a strict `application/json` response schema.
    * All API routes handling GLM requests must implement a try/catch block with up to 3 silent retries for malformed JSON parsing errors before failing gracefully.

## 4. Core System Workflows

### Student Flow
1.  **Ingestion:** Student inputs raw, unstructured text.
2.  **Structuring:** GLM parses input and creates a structured JSON profile.
3.  **Matching:** GLM calculates bidirectional match scores against open jobs.
4.  **Automation:** System auto-generates applications for jobs scoring > 85%.
5.  **State Management:** If Approved -> System unlocks chat/interview interface. If Rejected -> GLM generates an actionable, multi-step "Skill Quest" feedback loop based on the rejection reason and job requirements.

### Company Flow
1.  **Onboarding:** Company submits operational details; waits for Admin verification.
2.  **Job Creation:** Natural language input of requirements; GLM structures the requirements into specific data points.
3.  **Applicant Screening:** Company views high-density dashboard. Candidates are pre-filtered and sorted by the GLM's match score and reasoning trace.
4.  **Action:** Company approves or rejects. The system handles automated notifications and opens the chat proxy.

## 5. Coding Conventions & Agent Instructions
* When generating Next.js components, default to Server Components unless client-side interactivity (`useState`, `useEffect`, Firebase listeners) is explicitly required.
* Use Tailwind CSS utility classes exclusively for styling. Avoid writing custom CSS files.
* When executing database operations, ensure Firebase Security Rules logic is mirrored and respected in the API Route handlers.
* All GLM prompt templates should be isolated in a dedicated utility directory (e.g., `lib/prompts/`) rather than hardcoded within the route handlers.
* While writing the frontend elements, check if it is useful in other pages, if yes, make it as a components which save in the components/ui/company_view folder to be reused in different pages.

## 6. Task Distribution
| Team Member | Responsibilities |
| :--- | :--- |
| **Person 1** | **Core Setup & Infrastructure**<br>• Next.js setup & Middleware configuration<br>• Database & Auth: Firebase Auth, Cloud Firestore<br>• AI Engine Integration (GLM routing, schemas, and rate limits)<br>• Admin Verification Dashboard<br>• Deployment |
| **Person 2** | **Student Experience (UI & Backend)**<br>• Student Dashboard & Analytics<br>• AI Profile Builder UI and logic<br>• Application Status Tracker<br>• Job matching view and feedback rendering |
| **Person 3** | **Company Experience (UI & Backend)**<br>• Company Workspace Dashboard<br>• Natural Language Job Posting UI<br>• Chat Platform & Interview Session management<br>• Automated notification systems (Approval/Rejection) |
* I will be the person 3 who handle the company experience part