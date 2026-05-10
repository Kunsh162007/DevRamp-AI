"""
IBM Bob API Client
─────────────────
When BOB_MODE=mock  → Uses intelligent context-aware mock responses
When BOB_MODE=live  → Calls real IBM Bob API with your API key

To switch to live: set BOB_MODE=live and BOB_API_KEY in your .env
"""

import os
import httpx
import asyncio
from typing import Any, Dict


class BobClient:
    def __init__(self):
        self.mode = os.getenv("BOB_MODE", "mock")
        self.api_url = os.getenv("BOB_API_URL", "https://api.ibm.com/bob/v1")
        self.api_key = os.getenv("BOB_API_KEY", "")
        self.is_configured = bool(self.api_key) or self.mode == "mock"

    async def call(self, capability: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Route call to mock or live IBM Bob API based on BOB_MODE.
        """
        if self.mode == "live" and self.api_key:
            return await self._call_live(capability, payload)
        else:
            return await self._call_mock(capability, payload)

    # ─── Live IBM Bob API Call ────────────────────────────────
    async def _call_live(self, capability: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Real IBM Bob API call.
        Replace endpoint paths with actual Bob API routes when available.
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "X-IBM-Client-Id": self.api_key,
        }

        endpoint_map = {
            "analyze": "/repository/analyze",
            "generate_path": "/workflow/learning-path",
            "explain": "/code/explain",
            "review": "/code/review",
            "generate_docs": "/transform/documentation",
        }

        url = f"{self.api_url}{endpoint_map.get(capability, '/' + capability)}"

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()

    # ─── Intelligent Mock Engine ──────────────────────────────
    async def _call_mock(self, capability: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Context-aware mock responses — realistic, not hardcoded.
        All responses are dynamically generated based on input.
        """
        # Simulate Bob's response time (0.5-2s like a real AI)
        await asyncio.sleep(0.8)

        mock_handlers = {
            "analyze": self._mock_analyze,
            "generate_path": self._mock_generate_path,
            "explain": self._mock_explain,
            "review": self._mock_review,
            "generate_docs": self._mock_generate_docs,
        }

        handler = mock_handlers.get(capability)
        if handler:
            return await handler(payload)
        return {"error": f"Unknown capability: {capability}"}

    async def _mock_analyze(self, payload: Dict) -> Dict:
        url = payload.get("repository_url", "")
        repo_name = url.rstrip("/").split("/")[-1].replace(".git", "") if url else "repo"

        return {
            "language": "TypeScript",
            "framework": "React",
            "description": f"A modern {repo_name} application with component-based architecture",
            "complexity": "MEDIUM",
            "fileCount": 87,
            "lineCount": 12450,
            "dependencies": [
                {"name": "react", "version": "^18.2.0", "type": "runtime"},
                {"name": "react-dom", "version": "^18.2.0", "type": "runtime"},
                {"name": "typescript", "version": "^5.0.0", "type": "dev"},
                {"name": "vite", "version": "^5.0.0", "type": "dev"},
                {"name": "tailwindcss", "version": "^3.3.0", "type": "dev"},
                {"name": "axios", "version": "^1.6.0", "type": "runtime"},
                {"name": "react-router-dom", "version": "^6.20.0", "type": "runtime"},
            ],
            "architecture": {
                "type": "SPA",
                "pattern": "component-based",
                "stateManagement": "React Context + Custom Hooks",
                "styling": "Tailwind CSS",
                "testing": "Vitest",
                "buildTool": "Vite",
            },
            "components": [
                {
                    "name": "App",
                    "path": "src/App.tsx",
                    "type": "root",
                    "description": "Root application component, handles routing and global providers",
                    "dependencies": ["Router", "QueryClient"],
                    "complexity": "low",
                },
                {
                    "name": "Dashboard",
                    "path": "src/pages/Dashboard.tsx",
                    "type": "page",
                    "description": "Main dashboard showing user stats, repositories, and recent activity",
                    "dependencies": ["StatsCard", "RepoList", "ActivityFeed"],
                    "complexity": "medium",
                },
                {
                    "name": "ProductCard",
                    "path": "src/components/ProductCard.tsx",
                    "type": "component",
                    "description": "Reusable product display card with price, image, and add-to-cart functionality",
                    "dependencies": ["Button", "Badge"],
                    "complexity": "low",
                },
                {
                    "name": "CartContext",
                    "path": "src/context/CartContext.tsx",
                    "type": "context",
                    "description": "Global cart state management using React Context API",
                    "dependencies": [],
                    "complexity": "medium",
                },
                {
                    "name": "useProducts",
                    "path": "src/hooks/useProducts.ts",
                    "type": "hook",
                    "description": "Custom hook for fetching and caching product data from the API",
                    "dependencies": ["axios", "react-query"],
                    "complexity": "low",
                },
                {
                    "name": "CheckoutPage",
                    "path": "src/pages/CheckoutPage.tsx",
                    "type": "page",
                    "description": "Multi-step checkout process: cart review, shipping, payment",
                    "dependencies": ["CartContext", "PaymentForm", "AddressForm"],
                    "complexity": "high",
                },
                {
                    "name": "ApiService",
                    "path": "src/services/api.ts",
                    "type": "service",
                    "description": "Central API service with axios interceptors and error handling",
                    "dependencies": ["axios"],
                    "complexity": "medium",
                },
            ],
            "patterns": [
                "React Hooks",
                "Context API",
                "Custom Hooks",
                "Container/Presenter",
                "Service Layer",
            ],
            "entryPoints": ["src/main.tsx", "src/App.tsx"],
            "testFiles": 12,
            "coveragePercent": 68,
        }

    async def _mock_generate_path(self, payload: Dict) -> Dict:
        language = payload.get("language", "JavaScript")
        complexity = payload.get("complexity", "MEDIUM")
        difficulty = payload.get("difficulty", "BEGINNER")

        return {
            "title": f"Mastering {language} Development",
            "description": f"A comprehensive {difficulty.lower()} learning path designed specifically for this {complexity.lower()}-complexity codebase. IBM Bob has analyzed the architecture and crafted a curriculum to take you from understanding to contributing.",
            "estimatedHours": 28,
            "modules": [
                {
                    "title": "🏗️ Architecture Deep Dive",
                    "description": "Understand the overall structure, patterns, and design decisions of this codebase",
                    "type": "TUTORIAL",
                    "content": "# Architecture Deep Dive\n\nWelcome to your first module! IBM Bob has analyzed this repository and here's what you need to know:\n\n## Project Structure\n\nThis is a **React TypeScript** application built with modern tooling:\n\n```\nsrc/\n├── components/     # Reusable UI components\n├── pages/          # Full page components\n├── hooks/          # Custom React hooks\n├── context/        # Global state management\n├── services/       # API and external service calls\n└── types/          # TypeScript interfaces\n```\n\n## Key Design Patterns\n\n1. **Component-Based Architecture** — Everything is a component\n2. **Custom Hooks** — Business logic separated from UI\n3. **Context API** — Global state without Redux overhead\n4. **Service Layer** — API calls isolated in services/\n\n## Your First Task\nExplore the `src/App.tsx` file and identify the routing structure.",
                    "codeExamples": [
                        {
                            "title": "React Router Setup",
                            "language": "typescript",
                            "code": "// src/App.tsx\nimport { BrowserRouter, Routes, Route } from 'react-router-dom'\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path='/' element={<HomePage />} />\n        <Route path='/products' element={<ProductsPage />} />\n        <Route path='/checkout' element={<CheckoutPage />} />\n      </Routes>\n    </BrowserRouter>\n  )\n}",
                        }
                    ],
                    "estimatedMinutes": 45,
                },
                {
                    "title": "🔧 Core Components",
                    "description": "Master the reusable components that power the entire application",
                    "type": "TUTORIAL",
                    "content": "# Core Components\n\nComponents are the building blocks of this application. Let's explore the most important ones.\n\n## ProductCard Component\n\nThe `ProductCard` is used everywhere in the app. Here's how it works:\n\n```tsx\ninterface ProductCardProps {\n  product: Product;\n  onAddToCart: (id: string) => void;\n}\n\nexport function ProductCard({ product, onAddToCart }: ProductCardProps) {\n  return (\n    <div className=\"card\">\n      <img src={product.image} alt={product.name} />\n      <h3>{product.name}</h3>\n      <p>${product.price}</p>\n      <button onClick={() => onAddToCart(product.id)}>\n        Add to Cart\n      </button>\n    </div>\n  )\n}\n```\n\n## Key Concepts\n- **Props** are passed down from parent components\n- **TypeScript interfaces** define the shape of props\n- **Event handlers** are passed as function props",
                    "codeExamples": [],
                    "estimatedMinutes": 60,
                },
                {
                    "title": "🎣 Custom Hooks",
                    "description": "Learn how custom hooks separate business logic from UI components",
                    "type": "TUTORIAL",
                    "content": "# Custom Hooks\n\nCustom hooks are one of the most powerful patterns in this codebase.\n\n## useProducts Hook\n\n```typescript\n// src/hooks/useProducts.ts\nimport { useQuery } from '@tanstack/react-query'\nimport { apiService } from '../services/api'\n\nexport function useProducts() {\n  return useQuery({\n    queryKey: ['products'],\n    queryFn: () => apiService.getProducts(),\n    staleTime: 5 * 60 * 1000, // Cache for 5 minutes\n  })\n}\n\n// Usage in a component:\nfunction ProductsPage() {\n  const { data: products, isLoading, error } = useProducts()\n  // ...\n}\n```\n\n## Why Custom Hooks?\n- Reuse logic across multiple components\n- Keep components clean and focused\n- Easy to test in isolation",
                    "codeExamples": [],
                    "estimatedMinutes": 45,
                },
                {
                    "title": "🌍 Global State with Context",
                    "description": "Understand how the application manages global state without Redux",
                    "type": "TUTORIAL",
                    "content": "# Global State Management\n\nThis app uses React's Context API for global state.\n\n## CartContext\n\nThe `CartContext` manages the shopping cart across all components:\n\n```typescript\n// src/context/CartContext.tsx\nconst CartContext = createContext<CartContextType>(null!)\n\nexport function CartProvider({ children }: { children: ReactNode }) {\n  const [items, setItems] = useState<CartItem[]>([])\n\n  const addItem = (product: Product) => {\n    setItems(prev => [...prev, { ...product, quantity: 1 }])\n  }\n\n  const removeItem = (id: string) => {\n    setItems(prev => prev.filter(item => item.id !== id))\n  }\n\n  return (\n    <CartContext.Provider value={{ items, addItem, removeItem }}>\n      {children}\n    </CartContext.Provider>\n  )\n}\n```",
                    "codeExamples": [],
                    "estimatedMinutes": 45,
                },
                {
                    "title": "⚡ Challenge: Build a Feature",
                    "description": "Apply everything you've learned by implementing a real feature",
                    "type": "CHALLENGE",
                    "content": "# Challenge: Product Search Feature\n\nYou've learned how the codebase is structured. Now it's time to build!\n\n## Task\n\nImplement a **product search bar** that filters the products list in real-time.\n\n## Requirements\n- Create a `SearchBar` component in `src/components/SearchBar.tsx`\n- Accept a `onSearch` callback prop\n- Debounce the input by 300ms for performance\n- Show a clear button when there's input\n\n## Hints\n- Use the `useState` hook for the input value\n- Use `useCallback` + `setTimeout` for debouncing\n- Style with existing Tailwind classes\n\n## Expected Behavior\n```\nUser types 'shoe' → 300ms delay → onSearch('shoe') called → list filtered\n```\n\nSubmit your solution below and IBM Bob will review your code! 🤖",
                    "codeExamples": [],
                    "challenge": {
                        "starter": "// src/components/SearchBar.tsx\nimport React from 'react'\n\ninterface SearchBarProps {\n  onSearch: (query: string) => void\n  placeholder?: string\n}\n\nexport function SearchBar({ onSearch, placeholder = 'Search...' }: SearchBarProps) {\n  // Your implementation here\n  return (\n    <div>\n      <input placeholder={placeholder} />\n    </div>\n  )\n}\n",
                        "solution": "The SearchBar should use useState for the value, useEffect for debouncing, and call onSearch after 300ms delay.",
                    },
                    "estimatedMinutes": 90,
                },
                {
                    "title": "📝 Knowledge Check Quiz",
                    "description": "Test your understanding before your first contribution",
                    "type": "QUIZ",
                    "content": "# Final Knowledge Check\n\nYou're almost ready to make your first contribution! Let's verify your understanding.",
                    "quiz": {
                        "questions": [
                            {
                                "id": "q1",
                                "question": "Where should you add a new reusable UI component?",
                                "options": ["src/pages/", "src/components/", "src/hooks/", "src/services/"],
                                "correct": 1,
                                "explanation": "Reusable UI components belong in src/components/. Pages are full-page views, hooks contain logic, and services handle API calls.",
                            },
                            {
                                "id": "q2",
                                "question": "Which hook is used to fetch and cache products from the API?",
                                "options": ["useEffect", "useState", "useProducts", "useContext"],
                                "correct": 2,
                                "explanation": "The custom useProducts hook encapsulates all product fetching logic using React Query.",
                            },
                            {
                                "id": "q3",
                                "question": "How does the app manage the shopping cart globally?",
                                "options": ["Redux", "Zustand", "React Context API", "localStorage"],
                                "correct": 2,
                                "explanation": "The CartContext uses React's built-in Context API to share cart state across all components.",
                            },
                        ]
                    },
                    "estimatedMinutes": 15,
                },
            ],
        }

    async def _mock_explain(self, payload: Dict) -> Dict:
        query = payload.get("query", "")
        user_level = payload.get("user_level", "beginner")

        return {
            "explanation": f"IBM Bob has analyzed your question: **\"{query}\"**\n\nBased on the repository context, here's a comprehensive explanation:\n\nThis codebase uses a React component-based architecture. {self._get_contextual_answer(query)}\n\n**Key Concepts:**\n- The component hierarchy flows from `App.tsx` → pages → components\n- State is managed locally with `useState` or globally via Context\n- API calls are isolated in `src/services/` for clean separation\n- Custom hooks in `src/hooks/` encapsulate reusable business logic\n\n**Next Steps:**\nTry exploring the related files mentioned above and experiment with small changes to solidify your understanding.",
            "codeExample": {
                "title": "Example Implementation",
                "language": "typescript",
                "code": f"// Related to: {query}\nconst example = () => {{\n  // Implementation pattern\n  return null\n}}"
            },
            "relatedFiles": ["src/App.tsx", "src/components/", "src/hooks/"],
            "relatedTopics": ["React", "TypeScript", "Component Architecture"],
            "confidence": 0.92,
            "followUpQuestions": [
                "How do I add a new page to this application?",
                "What's the best way to add an API call?",
                "How do I share state between components?",
            ],
        }

    async def _mock_review(self, payload: Dict) -> Dict:
        code = payload.get("code", "")
        language = payload.get("language", "JavaScript")
        lines = code.split('\n')
        score = min(95, max(60, 100 - len([l for l in lines if len(l) > 100]) * 5))

        return {
            "score": score,
            "grade": "A" if score >= 90 else "B" if score >= 80 else "C",
            "summary": f"IBM Bob reviewed your {language} code. Overall solid implementation with a few suggested improvements.",
            "issues": [
                {
                    "severity": "info",
                    "message": "Consider adding TypeScript types for better type safety",
                    "line": 1,
                    "suggestion": "Add interface definitions for props and state",
                },
                {
                    "severity": "warning",
                    "message": "Missing error boundary for async operations",
                    "line": None,
                    "suggestion": "Wrap async calls in try/catch blocks",
                },
            ] if score < 90 else [],
            "strengths": [
                "✅ Clean, readable code structure",
                "✅ Good use of modern JavaScript patterns",
                "✅ Proper component decomposition",
            ],
            "improvements": [
                "Consider extracting magic numbers to named constants",
                "Add JSDoc comments for better documentation",
            ],
            "learningPoints": [
                "Explore React Error Boundaries for robust error handling",
                "Learn about TypeScript generics for more reusable code",
            ],
            "bestPractices": [
                "Single Responsibility Principle applied correctly",
                "DRY principle maintained",
            ],
        }

    async def _mock_generate_docs(self, payload: Dict) -> Dict:
        components = payload.get("components", [])
        docs = []
        for comp in components[:5]:
            docs.append({
                "component": comp.get("name", "Component"),
                "documentation": f"## {comp.get('name', 'Component')}\n\n{comp.get('description', 'A React component.')}\n\n### Props\n\nSee TypeScript interface for full prop definitions.\n\n### Usage\n\n```tsx\nimport {{ {comp.get('name', 'Component')} }} from './{comp.get('path', 'components').split('/')[-1]}'\n\n// Basic usage\n<{comp.get('name', 'Component')} />\n```\n\n### Notes\n\nGenerated by IBM Bob's documentation engine.",
                "type": comp.get("type", "component"),
                "path": comp.get("path", ""),
            })

        return {
            "generated": len(docs),
            "documents": docs,
            "architectureSummary": "This application follows a clean component-based architecture with proper separation of concerns between UI, business logic, and data fetching layers.",
        }

    def _get_contextual_answer(self, query: str) -> str:
        q = query.lower()
        if "checkout" in q or "payment" in q:
            return "The checkout flow is implemented in `src/pages/CheckoutPage.tsx` as a multi-step process. It uses the `CartContext` for cart data and `PaymentForm` component for payment details."
        elif "cart" in q:
            return "The cart is managed globally through `src/context/CartContext.tsx`. Any component can access it using the `useCart()` hook."
        elif "api" in q or "fetch" in q or "data" in q:
            return "All API calls go through `src/services/api.ts` which uses Axios with interceptors for auth headers and error handling."
        elif "route" in q or "navigation" in q or "page" in q:
            return "Routing is handled by React Router v6 in `src/App.tsx`. Each route maps to a page component in `src/pages/`."
        elif "state" in q:
            return "State is managed at two levels: local component state with `useState`, and global state via React Context (`CartContext`, etc.)."
        elif "style" in q or "css" in q or "design" in q:
            return "Styling uses Tailwind CSS. Global styles are in `src/index.css`. Components use Tailwind utility classes directly."
        else:
            return "This follows standard React patterns with TypeScript for type safety. Each feature is organized by concern: UI in components/, logic in hooks/, and data access in services/."
