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