from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import time
from datetime import datetime

# Import capability modules
from src.utils.bob_client import BobClient
from src.analyzers.code_analyzer import CodeAnalyzer
from src.generators.learning_path_generator import LearningPathGenerator
from src.explainers.code_explainer import CodeExplainer
from src.generators.doc_generator import DocGenerator
from src.analyzers.code_reviewer import CodeReviewer

# ─── App ─────────────────────────────────────────────────────
app = FastAPI(
    title="DevRamp AI — IBM Bob Integration Service",
    description="All 5 IBM Bob capabilities: Repository Analysis, Learning Path Generation, Code Explanation, Documentation Generation, Code Review",
    version="1.0.0",
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Shared instances ─────────────────────────────────────────
bob_client = BobClient()
analyzer = CodeAnalyzer(bob_client)
path_generator = LearningPathGenerator(bob_client)
explainer = CodeExplainer(bob_client)
doc_generator = DocGenerator(bob_client)
reviewer = CodeReviewer(bob_client)

# ─── Models ──────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    repository_url: str
    branch: str = "main"

class LearningPathRequest(BaseModel):
    repository_id: str
    complexity: str
    language: str
    difficulty: str = "BEGINNER"

class ExplainRequest(BaseModel):
    query: str
    code_context: str
    repository_id: str
    user_level: str = "beginner"

class ReviewRequest(BaseModel):
    code: str
    language: str
    context: Dict[str, Any] = {}

class GenerateDocsRequest(BaseModel):
    repository_id: str
    components: List[Dict[str, Any]]

# ─── Health Check ─────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "bob-integration",
        "bob_mode": bob_client.mode,
        "bob_configured": bob_client.is_configured,
    }

# ─── 1. Repository Analysis ──────────────────────────────────
@app.post("/analyze")
async def analyze_repository(request: AnalyzeRequest):
    """
    IBM Bob Capability: Repository Context Awareness
    Analyzes entire codebase structure, identifies components,
    builds dependency map, detects patterns and architecture.
    """
    start = time.time()
    try:
        result = await analyzer.analyze(
            repository_url=request.repository_url,
            branch=request.branch,
        )
        result["_meta"] = {
            "capability": "REPOSITORY_ANALYSIS",
            "latency_ms": int((time.time() - start) * 1000),
            "mode": bob_client.mode,
        }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 2. Learning Path Generation ─────────────────────────────
@app.post("/generate-learning-path")
async def generate_learning_path(request: LearningPathRequest):
    """
    IBM Bob Capability: Multi-step Workflow Automation
    Creates a personalized learning curriculum based on
    codebase complexity and developer skill level.
    """
    start = time.time()
    try:
        result = await path_generator.generate(
            repository_id=request.repository_id,
            complexity=request.complexity,
            language=request.language,
            difficulty=request.difficulty,
        )
        result["_meta"] = {
            "capability": "LEARNING_PATH_GENERATION",
            "latency_ms": int((time.time() - start) * 1000),
            "mode": bob_client.mode,
        }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 3. Code Explanation ─────────────────────────────────────
@app.post("/explain")
async def explain_code(request: ExplainRequest):
    """
    IBM Bob Capabilities: Intent Understanding + Logic Explanation
    Answers natural language questions about code with context-aware
    explanations, examples, and related resources.
    """
    start = time.time()
    try:
        result = await explainer.explain(
            query=request.query,
            code_context=request.code_context,
            repository_id=request.repository_id,
            user_level=request.user_level,
        )
        result["_meta"] = {
            "capability": "CODE_EXPLANATION",
            "latency_ms": int((time.time() - start) * 1000),
            "mode": bob_client.mode,
        }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 4. Documentation Generation ─────────────────────────────
@app.post("/generate-docs")
async def generate_docs(request: GenerateDocsRequest):
    """
    IBM Bob Capability: Complex Transformations
    Converts code components into human-readable documentation,
    API references, architecture guides, and usage examples.
    """
    start = time.time()
    try:
        result = await doc_generator.generate(
            repository_id=request.repository_id,
            components=request.components,
        )
        result["_meta"] = {
            "capability": "DOCUMENTATION_GENERATION",
            "latency_ms": int((time.time() - start) * 1000),
            "mode": bob_client.mode,
        }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 5. Code Review ──────────────────────────────────────────
@app.post("/review")
async def review_code(request: ReviewRequest):
    """
    IBM Bob Capability: Pattern Recognition + Best Practices
    Reviews submitted code for quality, patterns, and best
    practices. Provides actionable improvement suggestions.
    """
    start = time.time()
    try:
        result = await reviewer.review(
            code=request.code,
            language=request.language,
            context=request.context,
        )
        result["_meta"] = {
            "capability": "CODE_REVIEW",
            "latency_ms": int((time.time() - start) * 1000),
            "mode": bob_client.mode,
        }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)
