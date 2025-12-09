"use client";

import { useEffect, useState } from "react";
import { LoanProduct } from "@/lib/types";
import { LoanCard } from "@/components/loan-card";
import { AIChat } from "@/components/ai-chat";
import { Navbar } from "@/components/navbar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Sparkles } from "lucide-react";

export default function Dashboard() {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      // In a real app, this would use actual user ID
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "user-123", // Mock user ID
          creditScore: 720,
          income: 75000,
          loanAmount: 50000,
          preferredTermMonths: 60,
        }),
      });

      const data = await response.json();
      console.log("Recommendations API response:", data);
      
      // Handle both success and error responses - check for products array
      if (data && data.products && Array.isArray(data.products)) {
        if (data.products.length > 0) {
          setProducts(data.products);
          return;
        } else {
          console.warn("Empty products array returned");
        }
      } else {
        console.warn("Invalid response structure:", data);
      }

      // If no products in response, try fallback
      console.warn("No products in recommendations response, trying fallback...");
      throw new Error("No products returned");
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      // Fallback: try to fetch all products as backup
      try {
        console.log("Fetching fallback products...");
        const fallbackResponse = await fetch("/api/products");
        const fallbackData = await fallbackResponse.json();
        console.log("Fallback products response:", fallbackData);
        
        if (fallbackData.products && Array.isArray(fallbackData.products) && fallbackData.products.length > 0) {
          // Sort by eligibility score and take top 5
          const sortedProducts = fallbackData.products
            .sort((a: LoanProduct, b: LoanProduct) => b.eligibilityScore - a.eligibilityScore)
            .slice(0, 5);
          setProducts(sortedProducts);
        } else {
          console.error("No products available in fallback");
          setProducts([]);
        }
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAskAboutProduct = (productId: string) => {
    setSelectedProductId(productId);
    setIsChatOpen(true);
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Recommendations</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Your Personalized Loan Matches
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the best loan products tailored to your financial profile. 
            Our AI analyzes your needs to find perfect matches.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Finding your perfect loan matches...</p>
          </div>
        ) : products.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">No Recommendations Found</CardTitle>
              <CardDescription className="text-base mt-2">
                We couldn&apos;t find any loan products matching your profile at this time.
                Please try adjusting your preferences or check back later.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* Best Match Card - Highlighted */}
            {products.length > 0 && (
              <div className="fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Best Match</h2>
                    <p className="text-muted-foreground">Highest compatibility score</p>
                  </div>
                </div>
                <div className="max-w-2xl">
                  <LoanCard
                    product={products[0]}
                    isBestMatch={true}
                    onAskAboutProduct={handleAskAboutProduct}
                  />
                </div>
              </div>
            )}

            {/* Other Top Matches */}
            {products.length > 1 && (
              <div className="fade-in" style={{ animationDelay: "0.1s" }}>
                <h2 className="text-2xl font-bold mb-6">Other Top Matches</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
                  {products.slice(1).map((product, index) => (
                    <div key={product.id} className="slide-in" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                      <LoanCard
                        product={product}
                        onAskAboutProduct={handleAskAboutProduct}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogTitle className="sr-only">
            AI Chat - {selectedProduct?.name || "Loan Product"}
          </DialogTitle>
          {selectedProduct && (
            <AIChat
              product={selectedProduct}
              onClose={() => setIsChatOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
