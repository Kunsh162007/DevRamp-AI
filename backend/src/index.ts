import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import winston from 'winston'

// Load environment variables
dotenv.config()

// ─── Logger ─────────────────────────────────────────────────
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`
    })
  ),
  transports: [new winston.transports.Console()],
})

// ─── Prisma ──────────────────────────────────────────────────
export const prisma = new PrismaClient({
  log: ['error', 'warn'],
})

// ─── App Setup ───────────────────────────────────────────────
const app: Express = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 3001

// ─── Socket.io ───────────────────────────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  logger.info(`⚡ WebSocket client connected: ${socket.id}`)

  socket.on('join-repository', (repositoryId: string) => {
    socket.join(`repo:${repositoryId}`)
    logger.info(`Socket ${socket.id} joined room repo:${repositoryId}`)
  })

  socket.on('disconnect', () => {
    logger.info(`WebSocket client disconnected: ${socket.id}`)
  })
})

// ─── Middleware ───────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Routes ──────────────────────────────────────────────────
import authRouter from './routes/auth'
import repositoriesRouter from './routes/repositories'
import learningRouter from './routes/learning'
import progressRouter from './routes/progress'
import analyticsRouter from './routes/analytics'

app.use('/api/auth', authRouter)
app.use('/api/repositories', repositoriesRouter)
app.use('/api/learning', learningRouter)
app.use('/api/progress', progressRouter)
app.use('/api/analytics', analyticsRouter)

// ─── Health Check ────────────────────────────────────────────
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'devramp-ai-backend',
      database: 'connected',
      bobMode: process.env.BOB_MODE || 'mock',
    })
  } catch {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' })
  }
})

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  })
})

// ─── Error Handler ───────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`)
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  })
})

// ─── Start ───────────────────────────────────────────────────
async function main() {
  try {
    await prisma.$connect()
    logger.info('✅ Database connected')

    httpServer.listen(PORT, () => {
      logger.info(`🚀 DevRamp AI Backend running on http://localhost:${PORT}`)
      logger.info(`📍 Health: http://localhost:${PORT}/health`)
      logger.info(`🤖 Bob Mode: ${process.env.BOB_MODE || 'mock'}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

main()

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

export default app
