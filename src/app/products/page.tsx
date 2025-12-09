"use client";

import { useCallback, useEffect, useState } from "react";
import { LoanProduct, ProductFilter } from "@/lib/types";
import { LoanCard } from "@/components/loan-card";
import { ProductFilters } from "@/components/product-filters";
import { AIChat } from "@/components/ai-chat";
import { Navbar } from "@/components/navbar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilter>({});
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Client-side filtering for immediate feedback
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [filters.searchQuery, products]);

  const fetchProducts = useCallback(
    async (currentFilters: ProductFilter) => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        
        if (currentFilters.category && currentFilters.category.length > 0) {
          queryParams.append("category", currentFilters.category.join(","));
        }
        if (currentFilters.minAmount) {
          queryParams.append("minAmount", currentFilters.minAmount.toString());
        }
        if (currentFilters.maxAmount) {
          queryParams.append("maxAmount", currentFilters.maxAmount.toString());
        }
        if (currentFilters.minInterestRate) {
          queryParams.append("minInterestRate", currentFilters.minInterestRate.toString());
        }
        if (currentFilters.maxInterestRate) {
          queryParams.append("maxInterestRate", currentFilters.maxInterestRate.toString());
        }
        if (currentFilters.isPreApproved !== undefined) {
          queryParams.append("isPreApproved", currentFilters.isPreApproved.toString());
        }
        if (currentFilters.searchQuery) {
          queryParams.append("searchQuery", currentFilters.searchQuery);
        }

        const response = await fetch(`/api/products?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProducts(filters);
  }, [fetchProducts, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFiltersChange = (newFilters: ProductFilter) => {
    setFilters(newFilters);
  };

  const handleAskAboutProduct = (productId: string) => {
    setSelectedProductId(productId);
    setIsChatOpen(true);
  };

  const selectedProduct = filteredProducts.find((p) => p.id === selectedProductId) ||
    products.find((p) => p.id === selectedProductId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                All Loan Products
              </h1>
              <p className="text-lg text-muted-foreground">
                Browse and filter through all available loan products
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="w-full md:w-auto">
                View Dashboard
              </Button>
            </Link>
          </div>
          
          {/* Active Filters Indicator */}
          {Object.keys(filters).length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {Object.keys(filters).length} filter{Object.keys(filters).length !== 1 ? "s" : ""} active
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl">No Products Found</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Try adjusting your filters to see more results.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Showing <span className="font-bold text-foreground">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {filteredProducts.map((product, index) => (
                    <div key={product.id} className="fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
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
        </div>
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

