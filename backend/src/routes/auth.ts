import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

// ─── Register ────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, name, password, level } = req.body

    try {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' })
      }

      const hashed = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashed,
          level: level || 'BEGINNER',
        },
        select: { id: true, email: true, name: true, role: true, level: true, xp: true, createdAt: true },
      })

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'dev-secret-key',
        { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
      )

      res.status(201).json({ user, token })
    } catch (err) {
      console.error('Register error:', err)
      res.status(500).json({ error: 'Registration failed' })
    }
  }
)

// ─── Login ───────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'dev-secret-key',
        { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' }
      )

      const { password: _, ...userSafe } = user
      res.json({ user: userSafe, token })
    } catch (err) {
      console.error('Login error:', err)
      res.status(500).json({ error: 'Login failed' })
    }
  }
)

// ─── Me ──────────────────────────────────────────────────────
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, name: true, avatar: true,
        role: true, level: true, xp: true, createdAt: true,
        _count: { select: { repositories: true, progress: true } },
      },
    })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

export default router
