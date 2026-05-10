import { Server } from 'socket.io'
import { prisma, logger } from '../index'
import { BobService } from './bobService'

export class RepositoryService {
  /**
   * Full async analysis pipeline:
   * 1. Emit "started" websocket event
   * 2. Call Bob to analyze the repository
   * 3. Extract components, build dependency graph
   * 4. Generate learning paths via Bob
   * 5. Emit "complete" websocket event
   */
  static async analyzeAsync(
    repositoryId: string,
    url: string,
    branch: string,
    userId: string,
    io: Server
  ) {
    const emit = (event: string, data: any) => {
      io.to(`repo:${repositoryId}`).emit(event, data)
    }

    try {
      logger.info(`Starting analysis for repo ${repositoryId}`)

      // Mark as analyzing
      await prisma.repository.update({
        where: { id: repositoryId },
        data: { status: 'ANALYZING' },
      })

      emit('analysis:progress', { step: 'started', message: '🔍 Connecting to repository...', percent: 5 })
      await delay(800)

      emit('analysis:progress', { step: 'cloning', message: '📥 Reading repository structure...', percent: 15 })

      // ── Step 1: Bob analyzes repository ─────────────────────
      emit('analysis:progress', { step: 'bob_analyzing', message: '🤖 IBM Bob is analyzing your codebase...', percent: 30 })

      const analysis = await BobService.analyzeRepository({ repositoryId, url, branch, userId })

      emit('analysis:progress', { step: 'dependencies', message: '🔗 Building dependency graph...', percent: 55 })

      // Save analysis
      await prisma.repositoryAnalysis.upsert({
        where: { repositoryId },
        create: {
          repositoryId,
          complexity: analysis.complexity || 'MEDIUM',
          fileCount: analysis.fileCount || 0,
          lineCount: analysis.lineCount || 0,
          dependencies: analysis.dependencies || [],
          architecture: analysis.architecture || {},
          components: analysis.components || [],
          patterns: analysis.patterns || [],
        },
        update: {
          complexity: analysis.complexity || 'MEDIUM',
          fileCount: analysis.fileCount || 0,
          lineCount: analysis.lineCount || 0,
          dependencies: analysis.dependencies || [],
          architecture: analysis.architecture || {},
          components: analysis.components || [],
          patterns: analysis.patterns || [],
        },
      })

      // Update repo metadata
      await prisma.repository.update({
        where: { id: repositoryId },
        data: {
          language: analysis.language,
          framework: analysis.framework,
          description: analysis.description,
        },
      })

      emit('analysis:progress', { step: 'learning_paths', message: '📚 Generating personalized learning paths...', percent: 70 })

      // ── Step 2: Bob generates learning path ─────────────────
      const learningPath = await BobService.generateLearningPath({
        repositoryId,
        complexity: analysis.complexity || 'MEDIUM',
        language: analysis.language || 'JavaScript',
        difficulty: 'BEGINNER',
        userId,
      })

      emit('analysis:progress', { step: 'saving', message: '💾 Saving learning curriculum...', percent: 85 })

      // Save learning path
      const savedPath = await prisma.learningPath.create({
        data: {
          repositoryId,
          title: learningPath.title,
          description: learningPath.description,
          difficulty: 'BEGINNER',
          estimatedHours: learningPath.estimatedHours || 20,
          isDefault: true,
          modules: {
            create: (learningPath.modules || []).map((m: any, idx: number) => ({
              title: m.title,
              description: m.description,
              type: m.type || 'TUTORIAL',
              content: m.content || '',
              codeExamples: m.codeExamples || [],
              quiz: m.quiz || null,
              challenge: m.challenge || null,
              estimatedMinutes: m.estimatedMinutes || 30,
              order: idx,
            })),
          },
        },
      })

      emit('analysis:progress', { step: 'knowledge', message: '📖 Building knowledge base...', percent: 95 })

      // ── Step 3: Seed initial knowledge base ─────────────────
      if (analysis.components && analysis.components.length > 0) {
        await BobService.generateDocs({
          repositoryId,
          components: analysis.components.slice(0, 5),
          userId,
        })
      }

      // Mark complete
      await prisma.repository.update({
        where: { id: repositoryId },
        data: { status: 'READY', analyzedAt: new Date() },
      })

      emit('analysis:complete', {
        repositoryId,
        analysisId: repositoryId,
        learningPathId: savedPath.id,
        stats: {
          fileCount: analysis.fileCount,
          components: (analysis.components || []).length,
          modules: (learningPath.modules || []).length,
        },
      })

      logger.info(`Analysis complete for repo ${repositoryId}`)
    } catch (err: any) {
      logger.error(`Analysis failed for ${repositoryId}: ${err.message}`)

      await prisma.repository.update({
        where: { id: repositoryId },
        data: { status: 'ERROR' },
      })

      emit('analysis:error', { repositoryId, error: err.message })
    }
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
