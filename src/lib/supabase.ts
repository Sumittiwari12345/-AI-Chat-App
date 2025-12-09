import { createClient } from "@supabase/supabase-js";
import { LoanProduct } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not configured. Using mock data.");
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database schema types
export type Database = {
  public: {
    Tables: {
      loan_products: {
        Row: LoanProduct;
        Insert: Omit<LoanProduct, "id" | "createdAt" | "updatedAt">;
        Update: Partial<Omit<LoanProduct, "id" | "createdAt" | "updatedAt">>;
      };
      chat_sessions: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          messages: Array<{
            id: string;
            role: "user" | "assistant";
            content: string;
            timestamp: string;
          }>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          messages?: Array<{
            id: string;
            role: "user" | "assistant";
            content: string;
            timestamp: string;
          }>;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          product_id: string;
          user_id: string;
          messages: Array<{
            id: string;
            role: "user" | "assistant";
            content: string;
            timestamp: string;
          }>;
          updated_at: string;
        }>;
      };
    };
  };
};

