import { LoanProduct, LoanBadge } from "./types";

export function generateBadges(product: LoanProduct): LoanBadge[] {
  const badges: LoanBadge[] = [];

  // Pre-approved badge (highest priority)
  if (product.isPreApproved) {
    badges.push({
      id: "pre-approved",
      label: "Pre-Approved",
      variant: "success",
      priority: 1,
    });
  }

  // Low interest rate badge
  if (product.interestRate < 5) {
    badges.push({
      id: "low-rate",
      label: "Low Rate",
      variant: "success",
      priority: 2,
    });
  } else if (product.interestRate < 8) {
    badges.push({
      id: "competitive-rate",
      label: "Competitive Rate",
      variant: "default",
      priority: 3,
    });
  }

  // Fast processing badge
  if (product.processingTime.includes("24 hours") || product.processingTime.includes("Same day")) {
    badges.push({
      id: "fast-processing",
      label: "Fast Approval",
      variant: "success",
      priority: 2,
    });
  } else if (product.processingTime.includes("48 hours") || product.processingTime.includes("2 days")) {
    badges.push({
      id: "quick-processing",
      label: "Quick Processing",
      variant: "default",
      priority: 4,
    });
  }

  // High eligibility score badge
  if (product.eligibilityScore >= 85) {
    badges.push({
      id: "high-match",
      label: "High Match",
      variant: "success",
      priority: 2,
    });
  } else if (product.eligibilityScore >= 70) {
    badges.push({
      id: "good-match",
      label: "Good Match",
      variant: "default",
      priority: 5,
    });
  }

  // Flexible terms badge
  const termRange = product.maxTermMonths - product.minTermMonths;
  if (termRange >= 60) {
    badges.push({
      id: "flexible-terms",
      label: "Flexible Terms",
      variant: "default",
      priority: 4,
    });
  }

  // High loan amount badge
  if (product.maxAmount >= 500000) {
    badges.push({
      id: "high-limit",
      label: "High Limit",
      variant: "default",
      priority: 5,
    });
  }

  // No credit check badge (if applicable)
  if (product.creditScoreMin === null) {
    badges.push({
      id: "no-credit-check",
      label: "No Credit Check",
      variant: "secondary",
      priority: 3,
    });
  }

  // Low minimum amount badge
  if (product.minAmount <= 1000) {
    badges.push({
      id: "low-minimum",
      label: "Low Minimum",
      variant: "default",
      priority: 6,
    });
  }

  // Category-specific badges
  if (product.category === "home" && product.maxLtv && product.maxLtv >= 90) {
    badges.push({
      id: "high-ltv",
      label: "High LTV",
      variant: "default",
      priority: 4,
    });
  }

  // Sort by priority and return top badges (minimum 3, maximum 5)
  const sortedBadges = badges.sort((a, b) => a.priority - b.priority);
  
  // Ensure at least 3 badges, but prefer top priority ones
  if (sortedBadges.length < 3) {
    // Add default badges if needed
    sortedBadges.push({
      id: "available",
      label: "Available",
      variant: "outline",
      priority: 10,
    });
  }

  return sortedBadges.slice(0, 5);
}

