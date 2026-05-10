import axios from 'axios'
import { prisma, logger } from '../index'

const BOB_MODE = process.env.BOB_MODE || 'mock'
const BOB_SERVICE_URL = process.env.BOB_SERVICE_URL || 'http://localhost:8000'

// ─── Usage Logger ─────────────────────────────────────────────
async function logBobUsage(opts: {
  userId?: string
  capability: string
  prompt: string
  response: string
  latencyMs: number
  success: boolean
  errorMessage?: string
}) {
  try {
    await prisma.bobUsageLog.create({
      data: {
        userId: opts.userId,
        capability: opts.capability as any,
        prompt: opts.prompt,
        response: opts.response.slice(0, 5000),
        latencyMs: opts.latencyMs,
        success: opts.success,
        errorMessage: opts.errorMessage,
        mode: BOB_MODE,
      },
    })
  } catch (e) {
    logger.warn('Failed to log Bob usage: ' + e)
  }
}

// ─── Bob API Caller ───────────────────────────────────────────
async function callBobService(endpoint: string, payload: any) {
  const start = Date.now()
  const response = await axios.post(`${BOB_SERVICE_URL}${endpoint}`, payload, {
    timeout: 30000,
  })
  return { data: response.data, latencyMs: Date.now() - start }
}

// ─── BobService ───────────────────────────────────────────────
export class BobService {

  // 1. Repository Analysis (Repository Context Awareness)
  static async analyzeRepository(opts: {
    repositoryId: string
    url: string
    branch: string
    userId: string
  }) {
    const start = Date.now()
    const prompt = `Analyze repository: ${opts.url} on branch ${opts.branch}`
    try {
      const { data, latencyMs } = await callBobService('/analyze', {
        repository_url: opts.url,
        branch: opts.branch,
      })
      await logBobUsage({
        userId: opts.userId,
        capability: 'REPOSITORY_ANALYSIS',
        prompt,
        response: JSON.stringify(data),
        latencyMs,
        success: true,
      })
      return data
    } catch (err: any) {
      await logBobUsage({
        userId: opts.userId,
        capability: 'REPOSITORY_ANALYSIS',
        prompt,
        response: '',
        latencyMs: Date.now() - start,
        success: false,
        errorMessage: err.message,
      })
      throw err
    }
  }

  // 2. Learning Path Generation (Multi-step Workflow Automation)
  static async generateLearningPath(opts: {
    repositoryId: string
    complexity: string
    language: string
    difficulty: string
    userId: string
  }) {
    const start = Date.now()
    const prompt = `Generate ${opts.difficulty} learning path for ${opts.language} repo of ${opts.complexity} complexity`
    try {
      const { data, latencyMs } = await callBobService('/generate-learning-path', {
        repository_id: opts.repositoryId,
        complexity: opts.complexity,
        language: opts.language,
        difficulty: opts.difficulty,
      })
      await logBobUsage({
        userId: opts.userId,
        capability: 'LEARNING_PATH_GENERATION',
        prompt,
        response: JSON.stringify(data),
        latencyMs,
        success: true,
      })
      return data
    } catch (err: any) {
      await logBobUsage({
        userId: opts.userId,
        capability: 'LEARNING_PATH_GENERATION',
        prompt,
        response: '',
        latencyMs: Date.now() - start,
        success: false,
        errorMessage: err.message,
      })
      throw err
    }
  }

  // 3. Code Explanation (Intent Understanding + Logic Explanation)
  static async explainCode(opts: {
    query: string
    codeContext: string
    repositoryId: string
    language: string
    userId: string
  }) {
    const start = Date.now()
    try {
      const { data, latencyMs } = await callBobService('/explain', {
        query: opts.query,
        code_context: opts.codeContext,
        repository_id: opts.repositoryId,
        user_level: 'beginner',
      })
      await logBobUsage({
        userId: opts.userId,
        capability: 'CODE_EXPLANATION',
        prompt: opts.query,
        response: JSON.stringify(data),
        latencyMs,
        success: true,
      })
      return data
    } catch (err: any) {
      await logBobUsage({
        userId: opts.userId,
        capability: 'CODE_EXPLANATION',
        prompt: opts.query,
        response: '',
        latencyMs: Date.now() - start,
        success: false,
        errorMessage: err.message,
      })
      throw err
    }
  }

  // 4. Code Review (Pattern Recognition + Best Practices)
  static async reviewCode(opts: {
    code: string
    language: string
    context: any
    userId: string
  }) {
    const start = Date.now()
    const prompt = `Review ${opts.language} code: ${opts.code.slice(0, 200)}...`
    try {
      const { data, latencyMs } = await callBobService('/review', {
        code: opts.code,
        language: opts.language,
        context: opts.context,
      })
      await logBobUsage({
        userId: opts.userId,
        capability: 'CODE_REVIEW',
        prompt,
        response: JSON.stringify(data),
        latencyMs,
        success: true,
      })
      return data
    } catch (err: any) {
      await logBobUsage({
        userId: opts.userId,
        capability: 'CODE_REVIEW',
        prompt,
        response: '',
        latencyMs: Date.now() - start,
        success: false,
        errorMessage: err.message,
      })
      throw err
    }
  }

  // 5. Documentation Generation (Complex Transformations)
  static async generateDocs(opts: {
    repositoryId: string
    components: any[]
    userId: string
  }) {
    const start = Date.now()
    const prompt = `Generate documentation for ${opts.components.length} components`
    try {
      const { data, latencyMs } = await callBobService('/generate-docs', {
        repository_id: opts.repositoryId,
        components: opts.components,
      })
      await logBobUsage({
        userId: opts.userId,
        capability: 'DOCUMENTATION_GENERATION',
        prompt,
        response: JSON.stringify(data),
        latencyMs,
        success: true,
      })
      return data
    } catch (err: any) {
      await logBobUsage({
        userId: opts.userId,
        capability: 'DOCUMENTATION_GENERATION',
        prompt,
        response: '',
        latencyMs: Date.now() - start,
        success: false,
        errorMessage: err.message,
      })
      throw err
    }
  }
}
