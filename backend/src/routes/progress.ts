import { Router, Response } from 'express'
import { prisma } from '../index'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

// ─── Get progress for a repository ───────────────────────────
router.get('/:repositoryId', async (req: AuthRequest, res: Response) => {
  try {
    const progress = await prisma.progress.findMany({
      where: { userId: req.user!.id, repositoryId: req.params.repositoryId },
      include: {
        learningPath: {
          include: {
            modules: { select: { id: true, title: true, type: true, order: true } },
          },
        },
      },
    })
    res.json(progress)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress' })
  }
})

export default router
