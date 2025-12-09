"use client";

import { LoanProduct } from "@/lib/types";
import { generateBadges } from "@/lib/badge-logic";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, TrendingUp, Clock, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoanCardProps {
  product: LoanProduct;
  isBestMatch?: boolean;
  onAskAboutProduct: (productId: string) => void;
}

export function LoanCard({ product, isBestMatch = false, onAskAboutProduct }: LoanCardProps) {
  const badges = generateBadges(product);

  return (
    <Card
      className={cn(
        "relative card-hover overflow-hidden",
        isBestMatch 
          ? "ring-2 ring-green-500/50 ring-offset-2 bg-gradient-to-br from-green-50/50 to-background dark:from-green-950/20" 
          : "bg-card"
      )}
    >
      {isBestMatch && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600" />
      )}
      
      {isBestMatch && (
        <div className="absolute top-4 right-4">
          <Badge variant="success" className="text-xs font-bold shadow-sm">
            BEST MATCH
          </Badge>
        </div>
      )}

      <CardHeader className={cn("pb-3", isBestMatch && "pt-5")}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold mb-2 leading-tight">
              {product.name}
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed line-clamp-2">
              {product.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Interest Rate</span>
            </div>
            <p className="text-xl font-bold text-primary">{formatPercentage(product.interestRate)}</p>
          </div>
          
          <div className="p-2.5 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Loan Amount</span>
            </div>
            <p className="text-xs font-semibold leading-tight">
              {formatCurrency(product.minAmount)} - {formatCurrency(product.maxAmount)}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2.5 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Term</span>
            </div>
            <span className="font-semibold text-sm">
              {product.minTermMonths} - {product.maxTermMonths} months
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Processing</span>
            </div>
            <span className="font-semibold text-sm">{product.processingTime}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="pt-2">
          <div className="flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <Badge 
                key={badge.id} 
                variant={badge.variant}
                className="text-xs font-medium shadow-sm"
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Eligibility Score */}
        <div className="pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Eligibility Score</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all",
                    product.eligibilityScore >= 85 ? "bg-green-500" :
                    product.eligibilityScore >= 70 ? "bg-blue-500" :
                    "bg-yellow-500"
                  )}
                  style={{ width: `${product.eligibilityScore}%` }}
                />
              </div>
              <span className="text-xs font-bold">{product.eligibilityScore}/100</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Button
          className={cn(
            "w-full font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
            isBestMatch 
              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25 text-white border-0" 
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg border-0"
          )}
          size="default"
          onClick={() => onAskAboutProduct(product.id)}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Ask About Product
        </Button>
      </CardFooter>
    </Card>
  );
}

