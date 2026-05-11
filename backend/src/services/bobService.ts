import axios from 'axios'
import { logger } from '../index'

const BOB_SERVICE_URL = process.env.BOB_SERVICE_URL || 'http://localhost:8000'

export class BobService {
  static async analyzeRepository(params: {
    repositoryUrl: string
    branch: string
    userId: string
  }) {
    try {
      logger.info(`Calling Bob service to analyze: ${params.repositoryUrl}`)
      
      const response = await axios.post(
        `${BOB_SERVICE_URL}/analyze`,
        {
          repository_url: params.repositoryUrl,
          branch: params.branch,
        },
        { 
          timeout: 60000, // 60 second timeout
          headers: { 'Content-Type': 'application/json' }
        }
      )

      logger.info('Bob analysis completed successfully')
      return response.data
    } catch (error: any) {
      logger.error('Bob analyze error:', error.message)
      if (error.response) {
        logger.error('Bob error response:', error.response.data)
      }
      throw new Error('Repository analysis failed')
    }
  }

  static async generateLearningPath(params: {
    repositoryId: string
    complexity: string
    language: string
    difficulty: string
    userId: string
  }) {
    try {
      logger.info(`Generating learning path for repository ${params.repositoryId}`)
      
      const response = await axios.post(
        `${BOB_SERVICE_URL}/generate-learning-path`,
        {
          repository_id: params.repositoryId,
          complexity: params.complexity,
          language: params.language,
          difficulty: params.difficulty,
        },
        { 
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        }
      )

      logger.info('Learning path generated successfully')
      return response.data
    } catch (error: any) {
      logger.error('Bob learning path error:', error.message)
      if (error.response) {
        logger.error('Bob error response:', error.response.data)
      }
      throw new Error('Learning path generation failed')
    }
  }

  static async explainCode(params: {
    query: string
    codeContext: string
    repositoryId: string
    language: string
    userId: string
  }) {
    try {
      logger.info(`Explaining code for repository ${params.repositoryId}`)
      
      const response = await axios.post(
        `${BOB_SERVICE_URL}/explain`,
        {
          query: params.query,
          code_context: params.codeContext,
          repository_id: params.repositoryId,
          user_level: 'beginner',
        },
        { 
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        }
      )

      logger.info('Code explanation completed')
      return {
        explanation: response.data.explanation || response.data.answer,
        codeExamples: response.data.code_examples || [],
        relatedTopics: response.data.related_topics || [],
      }
    } catch (error: any) {
      logger.error('Bob explain error:', error.message)
      if (error.response) {
        logger.error('Bob error response:', error.response.data)
      }
      throw new Error('Code explanation failed')
    }
  }

  static async generateDocumentation(params: {
    repositoryId: string
    components: any[]
  }) {
    try {
      logger.info(`Generating documentation for repository ${params.repositoryId}`)
      
      const response = await axios.post(
        `${BOB_SERVICE_URL}/generate-docs`,
        {
          repository_id: params.repositoryId,
          components: params.components,
        },
        { 
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        }
      )

      logger.info('Documentation generated successfully')
      return response.data
    } catch (error: any) {
      logger.error('Bob documentation error:', error.message)
      if (error.response) {
        logger.error('Bob error response:', error.response.data)
      }
      throw new Error('Documentation generation failed')
    }
  }

  static async reviewCode(params: {
    code: string
    language: string
    context?: any
  }) {
    try {
      logger.info(`Reviewing ${params.language} code`)
      
      const response = await axios.post(
        `${BOB_SERVICE_URL}/review`,
        {
          code: params.code,
          language: params.language,
          context: params.context || {},
        },
        { 
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        }
      )

      logger.info('Code review completed')
      return response.data
    } catch (error: any) {
      logger.error('Bob review error:', error.message)
      if (error.response) {
        logger.error('Bob error response:', error.response.data)
      }
      throw new Error('Code review failed')
    }
  }
}

// Made with Bob
