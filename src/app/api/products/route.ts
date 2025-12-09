import { NextRequest, NextResponse } from "next/server";
import { productFilterSchema } from "@/lib/schemas";
import { ProductFilter } from "@/lib/types";
import { getMockProducts } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters: ProductFilter = {
      category: searchParams.get("category")?.split(",") as ProductFilter["category"],
      minAmount: searchParams.get("minAmount") ? Number(searchParams.get("minAmount")) : undefined,
      maxAmount: searchParams.get("maxAmount") ? Number(searchParams.get("maxAmount")) : undefined,
      minTermMonths: searchParams.get("minTermMonths") ? Number(searchParams.get("minTermMonths")) : undefined,
      maxTermMonths: searchParams.get("maxTermMonths") ? Number(searchParams.get("maxTermMonths")) : undefined,
      minInterestRate: searchParams.get("minInterestRate") ? Number(searchParams.get("minInterestRate")) : undefined,
      maxInterestRate: searchParams.get("maxInterestRate") ? Number(searchParams.get("maxInterestRate")) : undefined,
      isPreApproved: searchParams.get("isPreApproved") === "true" ? true : searchParams.get("isPreApproved") === "false" ? false : undefined,
      searchQuery: searchParams.get("searchQuery") || undefined,
    };

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined)
    );

    // Validate filters
    const validation = productFilterSchema.safeParse(cleanFilters);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid filter parameters", details: validation.error.errors },
        { status: 400 }
      );
    }

    const products = await getMockProducts();
    let filteredProducts = products;

    // Apply filters
    if (validation.data.category && validation.data.category.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        validation.data.category!.includes(p.category)
      );
    }

    if (validation.data.minAmount) {
      filteredProducts = filteredProducts.filter((p) => p.maxAmount >= validation.data.minAmount!);
    }

    if (validation.data.maxAmount) {
      filteredProducts = filteredProducts.filter((p) => p.minAmount <= validation.data.maxAmount!);
    }

    if (validation.data.minInterestRate) {
      filteredProducts = filteredProducts.filter((p) => p.interestRate >= validation.data.minInterestRate!);
    }

    if (validation.data.maxInterestRate) {
      filteredProducts = filteredProducts.filter((p) => p.interestRate <= validation.data.maxInterestRate!);
    }

    if (validation.data.isPreApproved !== undefined) {
      filteredProducts = filteredProducts.filter((p) => p.isPreApproved === validation.data.isPreApproved);
    }

    if (validation.data.searchQuery) {
      const query = validation.data.searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({ products: filteredProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    // Even on error, try to return products
    try {
      const products = await getMockProducts();
      return NextResponse.json({ 
        products: products,
        error: "Error applying filters, showing all products"
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

