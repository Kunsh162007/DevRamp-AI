import { Router, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { prisma, io, logger } from '../index'
import { authenticate, AuthRequest } from '../middleware/auth'
import { BobService } from '../services/bobService'
import { RepositoryService } from '../services/repositoryService'

const router = Router()

// All routes require auth
router.use(authenticate)

// ─── List repositories ───────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const repos = await prisma.repository.findMany({
      where: { userId: req.user!.id },
      include: {
        analysis: true,
        _count: { select: { learningPaths: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(repos)
  } catch (err) {
    logger.error('List repos error: ' + err)
    res.status(500).json({ error: 'Failed to fetch repositories' })
  }
})

// ─── Connect new repository ──────────────────────────────────
router.post(
  '/',
  [
    body('url').isURL().withMessage('Valid GitHub URL required'),
    body('branch').optional().trim(),
    body('name').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { url, branch = 'main', name } = req.body

    try {
      // Extract repo name from URL
      const repoName = name || url.split('/').slice(-1)[0].replace('.git', '')

      const repo = await prisma.repository.create({
        data: {
          userId: req.user!.id,
          url,
          branch,
          name: repoName,
          status: 'PENDING',
        },
      })

      // Kick off async analysis
      RepositoryService.analyzeAsync(repo.id, url, branch, req.user!.id, io)

      res.status(201).json(repo)
    } catch (err) {
      logger.error('Create repo error: ' + err)
      res.status(500).json({ error: 'Failed to connect repository' })
    }
  }
)

// ─── Get single repository ───────────────────────────────────
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const repo = await prisma.repository.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        analysis: true,
        learningPaths: {
          include: {
            modules: { orderBy: { order: 'asc' } },
            _count: { select: { modules: true } },
          },
        },
      },
    })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })
    res.json(repo)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch repository' })
  }
})

// ─── Re-trigger analysis ─────────────────────────────────────
router.post('/:id/analyze', async (req: AuthRequest, res: Response) => {
  try {
    const repo = await prisma.repository.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    await prisma.repository.update({
      where: { id: repo.id },
      data: { status: 'ANALYZING' },
    })

    RepositoryService.analyzeAsync(repo.id, repo.url, repo.branch, req.user!.id, io)

    res.json({ message: 'Analysis started', repositoryId: repo.id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to start analysis' })
  }
})

// ─── Get knowledge base ──────────────────────────────────────
router.get('/:id/knowledge', async (req: AuthRequest, res: Response) => {
  try {
    const entries = await prisma.knowledgeEntry.findMany({
      where: { repositoryId: req.params.id },
      orderBy: { views: 'desc' },
      take: 20,
    })
    res.json(entries)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch knowledge base' })
  }
})

// ─── AI Mentor: ask a question ───────────────────────────────
router.post('/:id/ask', async (req: AuthRequest, res: Response) => {
  const { question, context } = req.body
  if (!question) return res.status(400).json({ error: 'Question required' })

  try {
    const repo = await prisma.repository.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { analysis: true },
    })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    const answer = await BobService.explainCode({
      query: question,
      codeContext: context || '',
      repositoryId: repo.id,
      language: repo.language || 'JavaScript',
      userId: req.user!.id,
    })

    // Track in knowledge base
    await prisma.knowledgeEntry.create({
      data: {
        repositoryId: repo.id,
        type: 'FAQ',
        title: question.slice(0, 100),
        content: answer.explanation,
        tags: answer.relatedTopics || [],
      },
    })

    res.json(answer)
  } catch (err) {
    logger.error('Ask error: ' + err)
    res.status(500).json({ error: 'Failed to get answer' })
  }
})

export default router
