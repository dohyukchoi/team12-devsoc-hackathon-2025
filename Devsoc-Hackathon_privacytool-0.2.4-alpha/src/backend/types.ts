export enum Severity {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export interface PolicyIssue {
  issueType: string;
  summary: string;
  quote: string;
  severity: Severity;
}

export interface AnalysisResult {
  isRelevant: boolean;
  relevanceReason: string;
  issues: PolicyIssue[];
}