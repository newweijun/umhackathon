# FutureJobSenpai (LinkedFuture) 🚀
**Domain:** AI Systems & Agentic Workflow Automation

## 📌 Problem Statement
[cite_start]Across Malaysia and the rest of the world, individuals and organisations rely on fragmented, manual, and unstructured workflows to complete everyday tasks[cite: 3]. [cite_start]In the employment and recruitment sector, these workflows often require human interpretation, coordination across tools, and repeated decision-making, resulting in inefficiencies and errors[cite: 4]. 

Standard job boards act as static databases. They do not actively facilitate multi-step reasoning, handle ambiguous candidate data, or orchestrate the complex matchmaking logic required to connect the right talent with the right opportunity.

## 🎯 Objective
[cite_start]To design and build an AI-powered workflow system where Z.AI's GLM (General Language Model) acts as the central reasoning engine to transform fragmented recruitment workflows into an intelligent, automated process[cite: 5]. 

FutureJobSenpai is a stateful, adaptive workflow engine that dynamically bridges the gap between unstructured student profiles and strict corporate job requirements, facilitating end-to-end automation from resume parsing to interview scheduling.

## 👥 Target Audience
* **Students / Job Seekers:** Individuals looking to generate professional profiles and find highly matched career opportunities.
* **Companies (By Invitation):** Organizations looking to streamline administrative HR approvals and intelligently filter incoming applicants.

## ✨ Core Features (The Agentic Workflow)
Our system relies entirely on the GLM to orchestrate the following dynamic processes. [cite_start]If the GLM component is removed, the system will lose its ability to coordinate and execute the workflow effectively[cite: 10].

### Student View
* **Unstructured Profile Building:** Students input messy, unformatted text. The GLM parses this into a structured, optimized JSON resume.
* **Proactive Ambiguity Resolution:** If a student's input is missing crucial context (e.g., listing "React" without specifying years of experience), the GLM pauses the workflow to ask clarifying questions before generating the profile.
* **AI Match Engine (AI Model A):** Recommends perfectly matched companies and provides a calculated match percentage.
* **Actionable Feedback Loop:** If rejected, the GLM analyzes the company's rejection reason alongside the student's resume to generate a personalized "Skill Quest" roadmap for improvement.
* **Stateful Evaluator (Mock Interviews):** An AI-assisted chat session that acts as a proxy interviewer based on specific job requirements, dynamically updating the student's hidden skill matrix.

### Company View
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

1.  **Authentication:** User signs up and is immediately prompted to choose their role (Student or Company).
2.  **Student Flow:**
    * Create profile (AI parses raw text into a structured resume).
    * Choose job preferences (Location, salary, position).
    * AI orchestrates matching and sends the application.
    * *Edge Case 1 (Approval):* System orchestrates an interview session and opens the built-in chat platform.
    * *Edge Case 2 (Rejection):* AI generates actionable feedback and improvement suggestions.
3.  **Company Flow:**
    * Provide unstructured company details and expectations.
    * AI structures the requirements and filters incoming resumes with match percentages.
    * Company reviews GLM reasoning trace and approves/rejects.

## 💼 Business Model
* **Freemium Model:** Users are granted 3 "Agentic Workflow Tokens" (actions) per account.
* **Pro Subscription:** Unlocks unlimited AI orchestration, unrestricted resume generation, and unlimited interview setups.

## 🚀 Task Distribution (Hackathon Execution Plan)

| Area | Responsibilities | Tech |
| :--- | :--- | :--- |
| **Agentic AI & Prompt Engineering** | Design the core GLM multi-step reasoning prompts. Ensure the AI returns strict JSON schemas. [cite_start]Handle edge cases (ambiguity, missing data, failures)[cite: 14]. | Z.AI GLM API, TypeScript |
| **Frontend & UI/UX** | Build the role-based onboarding, the split-pane resume builder, and the high-density company dashboard. Ensure stateful feedback in the UI. | Next.js, Tailwind CSS |
| **Backend & Database** | Design the Postgres schemas (Users, Resumes, Jobs, Applications). Build the API routes to securely handle GLM payload transactions. | Next.js API Routes, PostgreSQL |
| **Auth & Deployment** | Set up Firebase Auth for Student/Company/Admin roles. Manage environment variables and deploy the prototype. | Firebase, Vercel/Render |

---
*Developed for the AI Systems & Agentic Workflow Automation Hackathon.*