# Loan Picks Dashboard

A production-ready, AI-powered loan product recommendation and comparison dashboard built with Next.js 14, TypeScript, shadcn/ui, and Supabase.

## 🎯 Project Overview

This dashboard provides personalized loan product recommendations with AI-powered chat assistance. Users can view their top 5 personalized loan matches, explore all available products with advanced filtering, and interact with an AI assistant that answers questions based solely on the selected product's information.

## ✨ Features

### Core Features
- **Personalized Dashboard**: Top 5 loan matches based on user profile
- **Best Match Highlighting**: Visual distinction for the highest-scoring match
- **Smart Badge System**: Automatically generated badges (3-5 per product) based on product attributes
- **AI Chat Interface**: Product-specific AI assistant with grounding strategy
- **Advanced Filtering**: Comprehensive product filtering system
- **Responsive Design**: Mobile-first, modern UI with shadcn/ui components

### Technical Features
- **TypeScript**: Full type safety, no `any` types
- **Zod Validation**: Runtime validation for all API inputs
- **AI Grounding**: Context-aware responses limited to product information
- **Fail-Safe Messaging**: Handles out-of-scope questions gracefully
- **Production-Ready**: Vercel deployment configuration included

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **UI**: shadcn/ui, Radix UI, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini
- **Validation**: Zod
- **Deployment**: Vercel

### Folder Structure
```
loan-picks-dashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── products/route.ts      # Product listing & filtering
│   │   │   ├── recommendations/route.ts # Personalized recommendations
│   │   │   └── chat/route.ts           # AI chat endpoint
│   │   ├── products/
│   │   │   └── page.tsx                # All products page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Dashboard page
│   │   └── globals.css                 # Global styles
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── select.tsx
│   │   ├── ai-chat.tsx                 # AI chat component
│   │   ├── loan-card.tsx               # Product card component
│   │   └── product-filters.tsx         # Filter component
│   └── lib/
│       ├── types.ts                    # TypeScript types
│       ├── schemas.ts                  # Zod schemas
│       ├── utils.ts                    # Utility functions
│       ├── badge-logic.ts              # Badge generation logic
│       ├── ai-grounding.ts             # AI grounding strategy
│       ├── supabase.ts                 # Supabase client
│       └── mock-data.ts                # Mock data (dev)
├── supabase/
│   └── schema.sql                      # Database schema
├── ARCHITECTURE.md                     # Architecture documentation
├── BADGE_LOGIC.md                      # Badge logic documentation
├── AI_GROUNDING.md                      # AI grounding strategy
└── README.md                           # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (or PostgreSQL database)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd loan-picks-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up database**
   - Create a new Supabase project
   - Run the SQL script from `supabase/schema.sql` in the Supabase SQL Editor
   - Or use the Supabase dashboard to create tables manually

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Data Model

### Loan Products Table
```sql
- id: UUID (Primary Key)
- name: VARCHAR(200)
- description: TEXT
- interest_rate: DECIMAL(5,2)
- min_amount: DECIMAL(15,2)
- max_amount: DECIMAL(15,2)
- min_term_months: INTEGER
- max_term_months: INTEGER
- eligibility_score: INTEGER (0-100)
- category: VARCHAR(50) (personal|home|auto|business|student|credit-card)
- features: JSONB (array of strings)
- requirements: JSONB (array of strings)
- is_pre_approved: BOOLEAN
- processing_time: VARCHAR(100)
- max_ltv: DECIMAL(5,2) (nullable)
- credit_score_min: INTEGER (nullable, 300-850)
- income_min: DECIMAL(15,2) (nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Chat Sessions Table
```sql
- id: UUID (Primary Key)
- product_id: UUID (Foreign Key → loan_products)
- user_id: UUID
- messages: JSONB (array of message objects)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 🔌 API Routes

### GET `/api/products`
Fetch all products with optional filtering.

**Query Parameters:**
- `category`: Comma-separated categories
- `minAmount`: Minimum loan amount
- `maxAmount`: Maximum loan amount
- `minInterestRate`: Minimum interest rate
- `maxInterestRate`: Maximum interest rate
- `isPreApproved`: Boolean
- `searchQuery`: Search string

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Product Name",
      ...
    }
  ]
}
```

### POST `/api/recommendations`
Get personalized loan recommendations.

**Request Body:**
```json
{
  "userId": "uuid",
  "creditScore": 720,
  "income": 75000,
  "loanAmount": 50000,
  "preferredTermMonths": 60
}
```

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "eligibilityScore": 92,
      ...
    }
  ]
}
```

### POST `/api/chat`
Send a message to the AI chat.

**Request Body:**
```json
{
  "message": "What is the interest rate?",
  "productId": "uuid",
  "history": []
}
```

**Response:**
```json
{
  "response": "The interest rate for this product is 4.5%..."
}
```

## 🎨 Badge Logic

The system automatically generates 3-5 badges per product based on attributes:

- **Pre-Approved**: `isPreApproved === true`
- **Low Rate**: `interestRate < 5%`
- **Fast Approval**: Processing time ≤ 24 hours
- **High Match**: `eligibilityScore >= 85`
- **Flexible Terms**: Term range ≥ 60 months
- And more...

See `BADGE_LOGIC.md` for complete documentation.

## 🤖 AI Grounding Strategy

The AI chat system uses a grounding strategy to ensure responses are based solely on the selected product:

1. **Product Context Injection**: Full product details included in every request
2. **Scope Detection**: Identifies out-of-scope questions
3. **Fail-Safe Messages**: Handles questions outside available data
4. **History Management**: Maintains conversation context (last 6 messages)

See `AI_GROUNDING.md` for detailed documentation.

## 🚢 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Supabase URL and keys
   - OpenAI API key

4. **Deploy**
   - Vercel will automatically deploy
   - Your app will be live at `your-project.vercel.app`

### Environment Variables (Production)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## 🧪 Development

### Running Tests
```bash
npm run lint
```

### Building for Production
```bash
npm run build
npm start
```

## 📝 Code Quality Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Next.js recommended configuration
- **Component Structure**: Reusable, composable components
- **API Validation**: All inputs validated with Zod
- **Error Handling**: Comprehensive error handling throughout

## 🔒 Security Considerations

- **Input Validation**: All API inputs validated with Zod schemas
- **Row-Level Security**: Supabase RLS policies enabled
- **Environment Variables**: Sensitive keys stored securely
- **API Key Protection**: Server-side only API key usage
- **SQL Injection Prevention**: Parameterized queries via Supabase

## 📚 Documentation

- **ARCHITECTURE.md**: System architecture and design decisions
- **BADGE_LOGIC.md**: Badge generation rules and logic
- **AI_GROUNDING.md**: AI chat grounding strategy details

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use Zod for validation
3. Maintain component reusability
4. Write clear, documented code
5. Test thoroughly before submitting

## 📄 License

This project is built for educational/demonstration purposes.

## 🎓 Assignment/Internship Notes

### Key Highlights
- **Production-Ready**: Full deployment configuration
- **Type-Safe**: Complete TypeScript implementation
- **Scalable**: Architecture supports growth
- **Documented**: Comprehensive documentation
- **Modern Stack**: Industry-standard technologies

### Learning Outcomes
- Next.js 14 App Router patterns
- TypeScript best practices
- AI integration with grounding
- Database design and queries
- API design and validation
- Component architecture
- Production deployment

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
"# The-Loan-Picks-Dashboard-" 
"# The-Loan-Picks-Dashboard-" 
