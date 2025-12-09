import { NextRequest, NextResponse } from "next/server";
import { chatMessageSchema } from "@/lib/schemas";
import { generateAIResponse, isQuestionOutOfScope } from "@/lib/ai-grounding";
import { getMockProducts } from "@/lib/mock-data";
import { ChatMessage } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, productId, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Validate message
    const messageValidation = chatMessageSchema.safeParse({
      role: "user",
      content: message,
      productId,
    });

    if (!messageValidation.success) {
      return NextResponse.json(
        { error: "Invalid message", details: messageValidation.error.errors },
        { status: 400 }
      );
    }

    // Get product
    const products = await getMockProducts();
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if question is out of scope
    if (isQuestionOutOfScope(message)) {
      return NextResponse.json({
        response:
          "I can only answer questions about this specific loan product based on the information available. Could you please ask about the product details, interest rates, eligibility requirements, terms, or features?",
      });
    }

    // Convert history to ChatMessage format
    const chatHistory: ChatMessage[] = Array.isArray(history)
      ? history.map((msg: unknown) => ({
          id: typeof msg === "object" && msg !== null && "id" in msg ? String(msg.id) : Date.now().toString(),
          role: typeof msg === "object" && msg !== null && "role" in msg && (msg.role === "user" || msg.role === "assistant") ? msg.role : "user",
          content: typeof msg === "object" && msg !== null && "content" in msg ? String(msg.content) : "",
          productId: typeof msg === "object" && msg !== null && "productId" in msg ? (msg.productId as string | null) : null,
          timestamp: typeof msg === "object" && msg !== null && "timestamp" in msg ? String(msg.timestamp) : new Date().toISOString(),
        }))
      : [];

    // Generate AI response
    try {
      const response = await generateAIResponse(message, product, chatHistory);
      return NextResponse.json({ response });
    } catch (aiError) {
      console.error("Error generating AI response:", aiError);
      // Return a helpful fallback response if AI fails
      return NextResponse.json({
        response: `Based on the ${product.name} product information:\n\n` +
          `- Interest Rate: ${product.interestRate}%\n` +
          `- Loan Amount Range: ${formatCurrency(product.minAmount)} - ${formatCurrency(product.maxAmount)}\n` +
          `- Term: ${product.minTermMonths} - ${product.maxTermMonths} months\n` +
          `- Processing Time: ${product.processingTime}\n` +
          `- Features: ${product.features.join(", ")}\n\n` +
          `For more specific questions, please contact our support team.`
      });
    }
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        response: "I apologize, but I'm having trouble processing your request right now. Please try again later."
      },
      { status: 500 }
    );
  }
}

