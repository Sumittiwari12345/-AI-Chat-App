export type LoanProduct = {
  id: string;
  name: string;
  description: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTermMonths: number;
  maxTermMonths: number;
  eligibilityScore: number;
  category: LoanCategory;
  features: string[];
  requirements: string[];
  isPreApproved: boolean;
  processingTime: string;
  maxLtv: number | null;
  creditScoreMin: number | null;
  incomeMin: number | null;
  createdAt: string;
  updatedAt: string;
};

export type LoanCategory =
  | "personal"
  | "home"
  | "auto"
  | "business"
  | "student"
  | "credit-card";

export type LoanBadge = {
  id: string;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "success";
  priority: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  productId: string | null;
  timestamp: string;
};

export type ChatSession = {
  id: string;
  productId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

export type ProductFilter = {
  category?: LoanCategory[];
  minAmount?: number;
  maxAmount?: number;
  minTermMonths?: number;
  maxTermMonths?: number;
  minInterestRate?: number;
  maxInterestRate?: number;
  isPreApproved?: boolean;
  searchQuery?: string;
};

export type RecommendationRequest = {
  userId: string;
  creditScore?: number;
  income?: number;
  loanAmount?: number;
  loanPurpose?: string;
  preferredTermMonths?: number;
};

