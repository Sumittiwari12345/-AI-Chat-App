"use client";

import { ProductFilter, LoanCategory } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";

interface ProductFiltersProps {
  filters: ProductFilter;
  onFiltersChange: (filters: ProductFilter) => void;
}

const categories: LoanCategory[] = ["personal", "home", "auto", "business", "student", "credit-card"];

export function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const updateFilter = <K extends keyof ProductFilter>(
    key: K,
    value: ProductFilter[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">Filters</CardTitle>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <div>
          <label className="text-sm font-medium mb-2 block">Search</label>
          <Input
            placeholder="Search products..."
            value={filters.searchQuery || ""}
            onChange={(e) => updateFilter("searchQuery", e.target.value || undefined)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <Select
            value={filters.category?.[0] || "all"}
            onValueChange={(value) =>
              updateFilter("category", value === "all" ? undefined : [value as LoanCategory])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Min Amount</label>
            <Input
              type="number"
              placeholder="₹0"
              value={filters.minAmount || ""}
              onChange={(e) =>
                updateFilter("minAmount", e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Max Amount</label>
            <Input
              type="number"
              placeholder="₹0"
              value={filters.maxAmount || ""}
              onChange={(e) =>
                updateFilter("maxAmount", e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Min Rate (%)</label>
            <Input
              type="number"
              step="0.1"
              placeholder="0"
              value={filters.minInterestRate || ""}
              onChange={(e) =>
                updateFilter("minInterestRate", e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Max Rate (%)</label>
            <Input
              type="number"
              step="0.1"
              placeholder="100"
              value={filters.maxInterestRate || ""}
              onChange={(e) =>
                updateFilter("maxInterestRate", e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Pre-Approved</label>
          <Select
            value={filters.isPreApproved === undefined ? "any" : filters.isPreApproved.toString()}
            onValueChange={(value) =>
              updateFilter("isPreApproved", value === "any" ? undefined : value === "true")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

