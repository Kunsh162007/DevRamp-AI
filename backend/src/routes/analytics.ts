import { Router, Response } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

// ─── Dashboard analytics ─────────────────────────────────────
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const [user, repos, progressRecords, bobLogs] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true, name: true },
      }),
      prisma.repository.findMany({
        where: { userId },
        select: { id: true, name: true, status: true, language: true, createdAt: true },
      }),
      prisma.progress.findMany({
        where: { userId },
        include: { learningPath: { select: { title: true } } },
      }),
      prisma.bobUsageLog.count({ where: { userId } }),
    ])

    const totalTimeMinutes = progressRecords.reduce(
      (sum, p) => sum + p.timeSpentMinutes,
      0
    )

    const completedModules = progressRecords.reduce(
      (sum, p) => sum + p.completedModules.length,
      0
    )

    const avgCompletion =
      progressRecords.length > 0
        ? progressRecords.reduce((sum, p) => sum + p.completionPct, 0) /
          progressRecords.length
        : 0

    res.json({
      user,
      stats: {
        repositoriesConnected: repos.length,
        modulesCompleted: completedModules,
        totalTimeMinutes,
        timeSavedDays: Math.round(totalTimeMinutes / 60 / 8), // saved vs manual
        bobInteractions: bobLogs,
        avgCompletion: Math.round(avgCompletion),
        xp: user?.xp || 0,
      },
      repositories: repos,
      recentProgress: progressRecords.slice(0, 5),
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' })
  }
})

// ─── Bob usage report ────────────────────────────────────────
router.get('/bob-usage', async (req: AuthRequest, res: Response) => {
  try {
    const [logs, byCapability, successRate] = await Promise.all([
      prisma.bobUsageLog.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          capability: true,
          latencyMs: true,
          success: true,
          mode: true,
          createdAt: true,
          tokensUsed: true,
        },
      }),
      prisma.bobUsageLog.groupBy({
        by: ['capability'],
        where: { userId: req.user!.id },
        _count: { id: true },
        _avg: { latencyMs: true },
      }),
      prisma.bobUsageLog.aggregate({
        where: { userId: req.user!.id },
        _count: { id: true },
        _avg: { latencyMs: true },
      }),
    ])

    const successCount = await prisma.bobUsageLog.count({
      where: { userId: req.user!.id, success: true },
    })

    res.json({
      totalCalls: successRate._count.id,
      avgLatencyMs: Math.round(successRate._avg.latencyMs || 0),
      successRate: successRate._count.id > 0
        ? Math.round((successCount / successRate._count.id) * 100)
        : 100,
      byCapability,
      recentLogs: logs,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Bob usage data' })
  }
})

export default router
