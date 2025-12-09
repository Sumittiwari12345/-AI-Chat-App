import { NextRequest, NextResponse } from "next/server";
import { recommendationRequestSchema } from "@/lib/schemas";
import { getMockProducts } from "@/lib/mock-data";

// GET endpoint as fallback - returns default recommendations
export async function GET() {
  try {
    const products = await getMockProducts();
    const defaultProducts = products
      .sort((a, b) => b.eligibilityScore - a.eligibilityScore)
      .slice(0, 5);
    return NextResponse.json({ products: defaultProducts });
  } catch (error) {
    console.error("Error in GET recommendations:", error);
    return NextResponse.json(
      { error: "Internal server error", products: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = recommendationRequestSchema.safeParse(body);
    if (!validation.success) {
      // If validation fails, still return products as fallback
      const products = await getMockProducts();
      const fallbackProducts = products
        .sort((a, b) => b.eligibilityScore - a.eligibilityScore)
        .slice(0, 5);
      return NextResponse.json({ 
        products: fallbackProducts,
        warning: "Invalid request parameters, showing default recommendations"
      });
    }

    const { creditScore, income, loanAmount, preferredTermMonths } = validation.data;
    const products = await getMockProducts();
    
    // Ensure we have products
    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "No products available", products: [] },
        { status: 404 }
      );
    }

    // Calculate eligibility scores based on user profile
    const scoredProducts = products.map((product) => {
      let score = 50; // Base score

      // Credit score matching
      if (creditScore && product.creditScoreMin) {
        if (creditScore >= product.creditScoreMin) {
          score += 20;
        } else {
          score -= 30;
        }
      }

      // Income matching
      if (income && product.incomeMin) {
        if (income >= product.incomeMin) {
          score += 15;
        } else {
          score -= 20;
        }
      }

      // Loan amount matching
      if (loanAmount) {
        if (loanAmount >= product.minAmount && loanAmount <= product.maxAmount) {
          score += 20;
        } else if (loanAmount < product.minAmount) {
          score -= 15;
        } else {
          score -= 10;
        }
      }

      // Term preference matching
      if (preferredTermMonths && product.minTermMonths && product.maxTermMonths) {
        if (
          preferredTermMonths >= product.minTermMonths &&
          preferredTermMonths <= product.maxTermMonths
        ) {
          score += 10;
        }
      }

      // Pre-approved bonus
      if (product.isPreApproved) {
        score += 15;
      }

      // Low interest rate bonus
      if (product.interestRate < 6) {
        score += 10;
      }

      return {
        ...product,
        eligibilityScore: Math.min(100, Math.max(0, score)),
      };
    });

    // Sort by eligibility score and return top 5
    const topProducts = scoredProducts
      .sort((a, b) => b.eligibilityScore - a.eligibilityScore)
      .slice(0, 5);

    // Ensure we always return at least some products (even if scores are low)
    if (topProducts.length === 0 && products.length > 0) {
      // Fallback: return top 5 products by original eligibility score
      const fallbackProducts = products
        .sort((a, b) => b.eligibilityScore - a.eligibilityScore)
        .slice(0, 5);
      return NextResponse.json({ products: fallbackProducts });
    }

    // Always return at least the top products, even if empty (shouldn't happen)
    return NextResponse.json({ 
      products: topProducts.length > 0 ? topProducts : products.slice(0, 5)
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    // Even on error, try to return default products
    try {
      const products = await getMockProducts();
      const fallbackProducts = products
        .sort((a, b) => b.eligibilityScore - a.eligibilityScore)
        .slice(0, 5);
      return NextResponse.json({ 
        products: fallbackProducts,
        error: "Error calculating personalized recommendations, showing default products"
      });
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return NextResponse.json(
        { error: "Internal server error", products: [] },
        { status: 500 }
      );
    }
  }
}

