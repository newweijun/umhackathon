export interface JobMatch {
  id: string;
  company: string;
  companyId: string;
  role: string;
  location: string;
  salary: string;
  baseSalary: number;
  datePosted: number;
  matchScore: number;
  aiReasoning: string;
  matchedSkills: string[];
  missingSkills: string[];
  description: string;
}

export type SortOption = "match" | "newest" | "salary";
