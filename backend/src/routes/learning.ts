import { Router, Response } from 'express'
import { prisma, logger } from '../index'
import { authenticate, AuthRequest } from '../middleware/auth'
import { BobService } from '../services/bobService'

const router = Router()
router.use(authenticate)

// ─── Get learning paths for a repo ───────────────────────────
router.get('/repositories/:repoId/paths', async (req: AuthRequest, res: Response) => {
  try {
    const repo = await prisma.repository.findFirst({
      where: { id: req.params.repoId, userId: req.user!.id },
    })
    if (!repo) return res.status(404).json({ error: 'Repository not found' })

    const paths = await prisma.learningPath.findMany({
      where: { repositoryId: req.params.repoId },
      include: {
        modules: { orderBy: { order: 'asc' } },
        _count: { select: { modules: true } },
        progress: {
          where: { userId: req.user!.id },
          take: 1,
        },
      },
    })
    res.json(paths)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch learning paths' })
  }
})

// ─── Get single module ───────────────────────────────────────
router.get('/modules/:id', async (req: AuthRequest, res: Response) => {
  try {
    const module = await prisma.learningModule.findUnique({
      where: { id: req.params.id },
      include: { learningPath: true },
    })
    if (!module) return res.status(404).json({ error: 'Module not found' })
    res.json(module)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch module' })
  }
})

// ─── Complete a module ───────────────────────────────────────
router.post('/modules/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const module = await prisma.learningModule.findUnique({
      where: { id: req.params.id },
      include: { learningPath: true },
    })
    if (!module) return res.status(404).json({ error: 'Module not found' })

    const path = module.learningPath

    // Upsert progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_learningPathId: {
          userId: req.user!.id,
          learningPathId: path.id,
        },
      },
      update: {
        completedModules: { push: module.id },
        lastActivityAt: new Date(),
        timeSpentMinutes: { increment: req.body.timeSpentMinutes || 0 },
      },
      create: {
        userId: req.user!.id,
        repositoryId: path.repositoryId,
        learningPathId: path.id,
        completedModules: [module.id],
        timeSpentMinutes: req.body.timeSpentMinutes || 0,
      },
    })

    // Update XP
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { xp: { increment: 50 } },
    })

    // Recalculate completion %
    const totalModules = await prisma.learningModule.count({
      where: { learningPathId: path.id },
    })
    const completionPct = (progress.completedModules.length / totalModules) * 100

    await prisma.progress.update({
      where: { id: progress.id },
      data: {
        completionPct,
        completedAt: completionPct >= 100 ? new Date() : null,
      },
    })

    res.json({ success: true, xpEarned: 50, completionPct })
  } catch (err) {
    logger.error('Complete module error: ' + err)
    res.status(500).json({ error: 'Failed to complete module' })
  }
})

// ─── Submit challenge for Bob review ─────────────────────────
router.post('/modules/:id/submit-challenge', async (req: AuthRequest, res: Response) => {
  const { code, language } = req.body
  if (!code) return res.status(400).json({ error: 'Code required' })

  try {
    const module = await prisma.learningModule.findUnique({
      where: { id: req.params.id },
      include: { learningPath: { include: { repository: true } } },
    })
    if (!module) return res.status(404).json({ error: 'Module not found' })

    const review = await BobService.reviewCode({
      code,
      language: language || module.learningPath.repository.language || 'JavaScript',
      context: { moduleTitle: module.title, challenge: module.challenge },
      userId: req.user!.id,
    })

    res.json(review)
  } catch (err) {
    logger.error('Submit challenge error: ' + err)
    res.status(500).json({ error: 'Failed to review code' })
  }
})

export default router
