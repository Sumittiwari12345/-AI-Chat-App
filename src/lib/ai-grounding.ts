import OpenAI from "openai";
import { LoanProduct, ChatMessage } from "./types";
import { formatCurrency } from "./utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const SYSTEM_PROMPT = `You are a helpful loan product assistant. Your role is to answer questions about loan products based ONLY on the provided product information.

CRITICAL RULES:
1. Answer questions ONLY using the provided product context
2. If asked about something not in the product information, politely decline and redirect to product details
3. Be concise, professional, and helpful
4. Never make up information not present in the context
5. If asked about comparisons with other products, explain you can only discuss the current product
6. Always maintain a helpful and friendly tone

Product Context:
{PRODUCT_CONTEXT}

Previous conversation history:
{HISTORY}`;

const FAIL_SAFE_MESSAGE = "I can only answer questions about this specific loan product based on the information available. Could you please ask about the product details, interest rates, eligibility requirements, terms, or features? I'm here to help you understand this loan product better.";

function buildProductSummaryResponse(product: LoanProduct): string {
  const features = product.features?.length ? product.features.join(", ") : "Not specified";
  const requirements = product.requirements?.length ? product.requirements.join(", ") : "Not specified";

  return [
    `Here are the key details for ${product.name}:`,
    `• Description: ${product.description}`,
    `• Category: ${product.category}`,
    `• Interest Rate: ${product.interestRate}%`,
    `• Amount Range: ${formatCurrency(product.minAmount)} - ${formatCurrency(product.maxAmount)}`,
    `• Term Range: ${product.minTermMonths} - ${product.maxTermMonths} months`,
    `• Eligibility Score: ${product.eligibilityScore}/100`,
    `• Pre-approved: ${product.isPreApproved ? "Yes" : "No"}`,
    product.processingTime ? `• Processing time: ${product.processingTime}` : null,
    product.creditScoreMin ? `• Minimum credit score: ${product.creditScoreMin}` : null,
    product.incomeMin ? `• Minimum income: ${formatCurrency(product.incomeMin)}` : null,
    product.maxLtv ? `• Maximum LTV: ${product.maxLtv}%` : null,
    `• Features: ${features}`,
    `• Requirements: ${requirements}`,
    "Ask about any of these points and I'll share more detail."
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateAIResponse(
  userMessage: string,
  product: LoanProduct,
  history: ChatMessage[]
): Promise<string> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "") {
    return buildProductSummaryResponse(product);
  }

  try {
    const productContext = `
Product Name: ${product.name}
Description: ${product.description}
Interest Rate: ${product.interestRate}%
Loan Amount Range: ${formatCurrency(product.minAmount)} - ${formatCurrency(product.maxAmount)}
Term Range: ${product.minTermMonths} - ${product.maxTermMonths} months
Category: ${product.category}
Eligibility Score: ${product.eligibilityScore}/100
Pre-Approved: ${product.isPreApproved ? "Yes" : "No"}
Processing Time: ${product.processingTime}
Features: ${product.features.join(", ")}
Requirements: ${product.requirements.join(", ")}
${product.creditScoreMin ? `Minimum Credit Score: ${product.creditScoreMin}` : ""}
${product.incomeMin ? `Minimum Income: ${formatCurrency(product.incomeMin)}` : ""}
${product.maxLtv ? `Maximum LTV: ${product.maxLtv}%` : ""}
`.trim();

    const historyContext = history
      .slice(-6) // Last 6 messages for context
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n");

    const prompt = SYSTEM_PROMPT
      .replace("{PRODUCT_CONTEXT}", productContext)
      .replace("{HISTORY}", historyContext || "No previous conversation.");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || FAIL_SAFE_MESSAGE;

    // Check if response seems to be outside product scope
    const lowerResponse = response.toLowerCase();
    const productKeywords = [
      product.name.toLowerCase(),
      product.category.toLowerCase(),
      "interest rate",
      "loan amount",
      "term",
      "eligibility",
      "requirement",
    ];

    const hasProductContext = productKeywords.some((keyword) =>
      lowerResponse.includes(keyword)
    );

    // If response doesn't reference product context, use fail-safe
    if (!hasProductContext && history.length === 0) {
      return buildProductSummaryResponse(product);
    }

    return response;
  } catch (error) {
    console.error("AI generation error:", error);
    return buildProductSummaryResponse(product);
  }
}

export function isQuestionOutOfScope(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  
  // Keywords that suggest questions outside product scope
  const outOfScopeKeywords = [
    "other products",
    "compare with",
    "better than",
    "competitor",
    "alternative",
    "different loan",
    "another bank",
    "other lender",
  ];

  return outOfScopeKeywords.some((keyword) => lowerQuestion.includes(keyword));
}

