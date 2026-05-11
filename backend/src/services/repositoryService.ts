import { Server } from 'socket.io'
import { prisma, logger } from '../index'
import { BobService } from './bobService'

export class RepositoryService {
  static async analyzeAsync(
    repoId: string,
    url: string,
    branch: string,
    userId: string,
    io: Server
  ) {
    try {
      // Update status to ANALYZING
      await prisma.repository.update({
        where: { id: repoId },
        data: { status: 'ANALYZING' },
      })

      // Emit progress to user
      io.to(`user:${userId}`).emit('repo:analyzing', { repositoryId: repoId })

      logger.info(`Starting analysis for repository ${repoId}`)

      // Call Bob service for analysis
      const analysis = await BobService.analyzeRepository({
        repositoryUrl: url,
        branch,
        userId,
      })

      logger.info(`Analysis completed for repository ${repoId}`)

      // Save analysis results
      await prisma.repositoryAnalysis.create({
        data: {
          repositoryId: repoId,
          language: analysis.language || 'Unknown',
          framework: analysis.framework || 'Unknown',
          complexity: analysis.complexity || 'MEDIUM',
          fileCount: analysis.fileCount || 0,
          lineCount: analysis.lineCount || 0,
          dependencies: analysis.dependencies || [],
          architecture: analysis.architecture || {},
          patterns: analysis.patterns || [],
          recommendations: analysis.recommendations || [],
        },
      })

      // Update repository with language and status
      await prisma.repository.update({
        where: { id: repoId },
        data: {
          language: analysis.language,
          status: 'READY',
        },
      })

      // Generate learning path automatically
      try {
        logger.info(`Generating learning path for repository ${repoId}`)
        
        const learningPath = await BobService.generateLearningPath({
          repositoryId: repoId,
          complexity: analysis.complexity || 'MEDIUM',
          language: analysis.language || 'JavaScript',
          difficulty: 'BEGINNER',
          userId,
        })

        await prisma.learningPath.create({
          data: {
            repositoryId: repoId,
            userId,
            title: learningPath.title,
            description: learningPath.description,
            difficulty: 'BEGINNER',
            estimatedHours: learningPath.estimatedHours || 40,
            modules: {
              create: learningPath.modules.map((mod: any, idx: number) => ({
                title: mod.title,
                description: mod.description,
                content: mod.content || '',
                order: idx,
                estimatedMinutes: mod.estimatedMinutes || 60,
                type: mod.type || 'LESSON',
              })),
            },
          },
        })

        logger.info(`Learning path created for repository ${repoId}`)
      } catch (err) {
        logger.error('Learning path generation failed:', err)
        // Don't fail the whole analysis if learning path fails
      }

      // Emit completion
      io.to(`user:${userId}`).emit('repo:ready', {
        repositoryId: repoId,
        analysis,
      })

      logger.info(`Repository ${repoId} analyzed successfully`)
    } catch (error) {
      logger.error(`Repository analysis failed for ${repoId}:`, error)

      // Update status to ERROR
      await prisma.repository.update({
        where: { id: repoId },
        data: { status: 'ERROR' },
      })

      // Emit error
      io.to(`user:${userId}`).emit('repo:error', {
        repositoryId: repoId,
        error: 'Analysis failed',
      })
    }
  }
}

// Made with Bob
