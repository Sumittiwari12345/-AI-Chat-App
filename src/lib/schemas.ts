import { z } from "zod";

export const loanProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  interestRate: z.number().min(0).max(100),
  minAmount: z.number().positive(),
  maxAmount: z.number().positive(),
  minTermMonths: z.number().int().positive(),
  maxTermMonths: z.number().int().positive(),
  eligibilityScore: z.number().min(0).max(100),
  category: z.enum(["personal", "home", "auto", "business", "student", "credit-card"]),
  features: z.array(z.string()).min(1),
  requirements: z.array(z.string()).min(1),
  isPreApproved: z.boolean(),
  processingTime: z.string(),
  maxLtv: z.number().min(0).max(100).nullable(),
  creditScoreMin: z.number().int().min(300).max(850).nullable(),
  incomeMin: z.number().positive().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const recommendationRequestSchema = z.object({
  userId: z.string().min(1), // Accept any non-empty string for userId
  creditScore: z.number().int().min(300).max(850).optional(),
  income: z.number().positive().optional(),
  loanAmount: z.number().positive().optional(),
  loanPurpose: z.string().max(500).optional(),
  preferredTermMonths: z.number().int().positive().optional(),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(5000),
  // Accept any non-empty string for productId; mock data uses simple IDs not UUIDs
  productId: z.string().min(1).nullable(),
});

export const productFilterSchema = z.object({
  category: z.array(z.enum(["personal", "home", "auto", "business", "student", "credit-card"])).optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  minTermMonths: z.number().int().positive().optional(),
  maxTermMonths: z.number().int().positive().optional(),
  minInterestRate: z.number().min(0).max(100).optional(),
  maxInterestRate: z.number().min(0).max(100).optional(),
  isPreApproved: z.boolean().optional(),
  searchQuery: z.string().max(200).optional(),
});

export type LoanProductInput = z.infer<typeof loanProductSchema>;
export type RecommendationRequestInput = z.infer<typeof recommendationRequestSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;

