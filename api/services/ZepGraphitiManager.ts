import { Graphiti } from '@zep-ai/graphiti';
import { config } from '../config';

// Zep Graphiti相关类型定义
interface TemporalEntity {
  entityId: string;
  entityType: string;
  properties: Record<string, any>;
  userId: string;
  projectId?: string;
  temporalContext: {
    createdAt: Date;
    lastUpdated: Date;
    validFrom?: Date;
    validTo?: Date;
  };
  metadata: Record<string, any>;
}

interface DynamicRelation {
  relationId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  strength: number;
  temporalContext: {
    createdAt: Date;
    lastUpdated: Date;
    validFrom?: Date;
    validTo?: Date;
  };
  properties: Record<string, any>;
  metadata: Record<string, any>;
}

interface EntityTimeline {
  entityId: string;
  timelineEvents: Array<{
    timestamp: Date;
    eventType: 'created' | 'updated' | 'relation_added' | 'relation_removed';
    changes: Record<string, any>;
    context?: Record<string, any>;
  }>;
}

interface TraversalResult {
  path: Array<{
    entityId: string;
    relationId?: string;
    relationType?: string;
    depth: number;
  }>;
  totalNodes: number;
  totalEdges: number;
  executionTime: number;
}

interface SynthesizedMemory {
  memoryId: string;
  content: string;
  sourceSessionIds: string[];
  confidence: number;
  temporalCoherence: number;
  conflictResolutions: Array<{
    conflictType: string;
    resolution: string;
    confidence: number;
  }>;
}

interface DeduplicationResult {
  duplicatesFound: number;
  duplicatesRemoved: number;
  memorySpaceSaved: number;
  duplicateGroups: Array<{
    groupId: string;
    duplicateIds: string[];
    similarityScore: number;
    mergedInto?: string;
  }>;
}

interface OptimizationSuggestion {
  type: 'memory_compression' | 'relation_pruning' | 'entity_merging' | 'temporal_archiving';
  priority: 'high' | 'medium' | 'low';
  description: string;
  estimatedImpact: {
    memoryReduction?: number;
    performanceGain?: number;
    accuracyImpact?: number;
  };
  actionRequired: string;
}

export class ZepGraphitiManager {
  private graphitiClient: Graphiti;
  private isInitialized = false;

  constructor() {
    this.graphitiClient = new Graphiti({
      apiKey: config.zep.apiKey,
      baseUrl: config.zep.baseUrl,
      timeout: config.zep.timeout || 30000,
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 初始化Graphiti客户端连接
      await this.graphitiClient.initialize();
      
      this.isInitialized = true;
      console.log('✅ Zep Graphiti manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Zep Graphiti manager:', error);
      throw error;
    }
  }

  // 时序实体管理
  async getTemporalEntities(options: {
    userId: string;
    projectId?: string;
    entityType?: string;
    timeRange?: { start: Date; end: Date };
    limit: number;
    offset: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<TemporalEntity[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { userId, projectId, entityType, timeRange, limit, offset, sortBy, sortOrder } = options;

      const queryFilters = {
        userId,
        ...(projectId && { projectId }),
        ...(entityType && { entityType }),
        ...(timeRange && {
          temporalContext: {
            createdAt: { $gte: timeRange.start, $lte: timeRange.end }
          }
        }),
      };

      const entities = await this.graphitiClient.entities.search({
        filters: queryFilters,
        limit,
        offset,
        sortBy,
        sortOrder,
      });

      return entities.map(entity => ({
        entityId: entity.id,
        entityType: entity.type,
        properties: entity.properties,
        userId: entity.userId,
        projectId: entity.projectId,
        temporalContext: {
          createdAt: new Date(entity.createdAt),
          lastUpdated: new Date(entity.lastUpdated),
          validFrom: entity.validFrom ? new Date(entity.validFrom) : undefined,
          validTo: entity.validTo ? new Date(entity.validTo) : undefined,
        },
        metadata: entity.metadata || {},
      }));
    } catch (error) {
      console.error('Failed to get temporal entities:', error);
      throw error;
    }
  }

  async createOrUpdateEntity(options: {
    entityId: string;
    entityType: string;
    properties: Record<string, any>;
    userId: string;
    projectId?: string;
    temporalContext?: {
      validFrom?: Date;
      validTo?: Date;
    };
    metadata: Record<string, any>;
  }): Promise<TemporalEntity> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { entityId, entityType, properties, userId, projectId, temporalContext, metadata } = options;

      const entityData = {
        id: entityId,
        type: entityType,
        properties,
        userId,
        projectId,
        validFrom: temporalContext?.validFrom?.toISOString(),
        validTo: temporalContext?.validTo?.toISOString(),
        metadata,
      };

      const entity = await this.graphitiClient.entities.upsert(entityData);

      return {
        entityId: entity.id,
        entityType: entity.type,
        properties: entity.properties,
        userId: entity.userId,
        projectId: entity.projectId,
        temporalContext: {
          createdAt: new Date(entity.createdAt),
          lastUpdated: new Date(entity.lastUpdated),
          validFrom: entity.validFrom ? new Date(entity.validFrom) : undefined,
          validTo: entity.validTo ? new Date(entity.validTo) : undefined,
        },
        metadata: entity.metadata || {},
      };
    } catch (error) {
      console.error('Failed to create or update entity:', error);
      throw error;
    }
  }

  async getEntityTimeline(options: {
    entityId: string;
    userId: string;
    projectId?: string;
    timeRange?: { start: Date; end: Date };
    granularity: string;
    includeRelations: boolean;
  }): Promise<EntityTimeline> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { entityId, userId, projectId, timeRange, granularity, includeRelations } = options;

      const timelineData = await this.graphitiClient.entities.getTimeline({
        entityId,
        userId,
        projectId,
        timeRange: timeRange ? {
          start: timeRange.start.toISOString(),
          end: timeRange.end.toISOString(),
        } : undefined,
        granularity,
        includeRelations,
      });

      return {
        entityId,
        timelineEvents: timelineData.events.map(event => ({
          timestamp: new Date(event.timestamp),
          eventType: event.type as 'created' | 'updated' | 'relation_added' | 'relation_removed',
          changes: event.changes,
          context: event.context,
        })),
      };
    } catch (error) {
      console.error('Failed to get entity timeline:', error);
      throw error;
    }
  }

  // 动态关系管理
  async getDynamicRelations(options: {
    userId: string;
    projectId?: string;
    sourceEntityId?: string;
    targetEntityId?: string;
    relationType?: string;
    strengthThreshold: number;
    timeRange?: { start: Date; end: Date };
    limit: number;
    offset: number;
  }): Promise<DynamicRelation[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        userId,
        projectId,
        sourceEntityId,
        targetEntityId,
        relationType,
        strengthThreshold,
        timeRange,
        limit,
        offset,
      } = options;

      const queryFilters = {
        userId,
        ...(projectId && { projectId }),
        ...(sourceEntityId && { sourceEntityId }),
        ...(targetEntityId && { targetEntityId }),
        ...(relationType && { relationType }),
        strength: { $gte: strengthThreshold },
        ...(timeRange && {
          temporalContext: {
            createdAt: { $gte: timeRange.start, $lte: timeRange.end }
          }
        }),
      };

      const relations = await this.graphitiClient.relations.search({
        filters: queryFilters,
        limit,
        offset,
      });

      return relations.map(relation => ({
        relationId: relation.id,
        sourceEntityId: relation.sourceEntityId,
        targetEntityId: relation.targetEntityId,
        relationType: relation.type,
        strength: relation.strength,
        temporalContext: {
          createdAt: new Date(relation.createdAt),
          lastUpdated: new Date(relation.lastUpdated),
          validFrom: relation.validFrom ? new Date(relation.validFrom) : undefined,
          validTo: relation.validTo ? new Date(relation.validTo) : undefined,
        },
        properties: relation.properties,
        metadata: relation.metadata || {},
      }));
    } catch (error) {
      console.error('Failed to get dynamic relations:', error);
      throw error;
    }
  }

  async inferDynamicRelations(options: {
    sourceEntityId: string;
    targetEntityId: string;
    context?: string;
    userId: string;
    projectId?: string;
    temporalWindow?: { start: Date; end: Date };
    inferenceStrategy: string;
  }): Promise<DynamicRelation[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        sourceEntityId,
        targetEntityId,
        context,
        userId,
        projectId,
        temporalWindow,
        inferenceStrategy,
      } = options;

      const inferenceParams = {
        sourceEntityId,
        targetEntityId,
        context,
        userId,
        projectId,
        temporalWindow: temporalWindow ? {
          start: temporalWindow.start.toISOString(),
          end: temporalWindow.end.toISOString(),
        } : undefined,
        strategy: inferenceStrategy,
      };

      const inferredRelations = await this.graphitiClient.relations.infer(inferenceParams);

      return inferredRelations.map(relation => ({
        relationId: relation.id,
        sourceEntityId: relation.sourceEntityId,
        targetEntityId: relation.targetEntityId,
        relationType: relation.type,
        strength: relation.strength,
        temporalContext: {
          createdAt: new Date(relation.createdAt),
          lastUpdated: new Date(relation.lastUpdated),
          validFrom: relation.validFrom ? new Date(relation.validFrom) : undefined,
          validTo: relation.validTo ? new Date(relation.validTo) : undefined,
        },
        properties: relation.properties,
        metadata: relation.metadata || {},
      }));
    } catch (error) {
      console.error('Failed to infer dynamic relations:', error);
      throw error;
    }
  }

  // 时序图谱遍历
  async traverseTemporalGraph(options: {
    startEntityId: string;
    endEntityId?: string;
    maxDepth: number;
    relationTypes?: string[];
    temporalConstraints?: Record<string, any>;
    userId: string;
    projectId?: string;
    algorithm: string;
  }): Promise<TraversalResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        startEntityId,
        endEntityId,
        maxDepth,
        relationTypes,
        temporalConstraints,
        userId,
        projectId,
        algorithm,
      } = options;

      const traversalParams = {
        startEntityId,
        endEntityId,
        maxDepth,
        relationTypes,
        temporalConstraints,
        userId,
        projectId,
        algorithm,
      };

      const startTime = Date.now();
      const traversalResult = await this.graphitiClient.graph.traverse(traversalParams);
      const executionTime = Date.now() - startTime;

      return {
        path: traversalResult.path.map((node, index) => ({
          entityId: node.entityId,
          relationId: node.relationId,
          relationType: node.relationType,
          depth: index,
        })),
        totalNodes: traversalResult.totalNodes,
        totalEdges: traversalResult.totalEdges,
        executionTime,
      };
    } catch (error) {
      console.error('Failed to traverse temporal graph:', error);
      throw error;
    }
  }

  // 跨会话记忆合成
  async synthesizeCrossSessionMemories(options: {
    sessionIds: string[];
    userId: string;
    projectId?: string;
    synthesisStrategy: string;
    timeWindow?: { start: Date; end: Date };
    conflictResolution: string;
  }): Promise<SynthesizedMemory[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        sessionIds,
        userId,
        projectId,
        synthesisStrategy,
        timeWindow,
        conflictResolution,
      } = options;

      const synthesisParams = {
        sessionIds,
        userId,
        projectId,
        strategy: synthesisStrategy,
        timeWindow: timeWindow ? {
          start: timeWindow.start.toISOString(),
          end: timeWindow.end.toISOString(),
        } : undefined,
        conflictResolution,
      };

      const synthesisResult = await this.graphitiClient.memories.synthesize(synthesisParams);

      return synthesisResult.synthesizedMemories.map(memory => ({
        memoryId: memory.id,
        content: memory.content,
        sourceSessionIds: memory.sourceSessionIds,
        confidence: memory.confidence,
        temporalCoherence: memory.temporalCoherence,
        conflictResolutions: memory.conflictResolutions,
      }));
    } catch (error) {
      console.error('Failed to synthesize cross-session memories:', error);
      throw error;
    }
  }

  // 智能去重
  async performIntelligentDeduplication(options: {
    userId: string;
    projectId?: string;
    deduplicationStrategy: string;
    similarityThreshold: number;
    temporalWindow?: { start: Date; end: Date };
    dryRun: boolean;
  }): Promise<DeduplicationResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const {
        userId,
        projectId,
        deduplicationStrategy,
        similarityThreshold,
        temporalWindow,
        dryRun,
      } = options;

      const deduplicationParams = {
        userId,
        projectId,
        strategy: deduplicationStrategy,
        similarityThreshold,
        temporalWindow: temporalWindow ? {
          start: temporalWindow.start.toISOString(),
          end: temporalWindow.end.toISOString(),
        } : undefined,
        dryRun,
      };

      const deduplicationResult = await this.graphitiClient.memories.deduplicate(deduplicationParams);

      return {
        duplicatesFound: deduplicationResult.duplicatesFound,
        duplicatesRemoved: deduplicationResult.duplicatesRemoved,
        memorySpaceSaved: deduplicationResult.memorySpaceSaved,
        duplicateGroups: deduplicationResult.duplicateGroups.map(group => ({
          groupId: group.id,
          duplicateIds: group.duplicateIds,
          similarityScore: group.similarityScore,
          mergedInto: group.mergedInto,
        })),
      };
    } catch (error) {
      console.error('Failed to perform intelligent deduplication:', error);
      throw error;
    }
  }

  // 时序感知优化建议
  async getTemporalOptimizationSuggestions(options: {
    userId: string;
    projectId?: string;
    optimizationType: string;
    analysisDepth: string;
  }): Promise<OptimizationSuggestion[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { userId, projectId, optimizationType, analysisDepth } = options;

      const analysisParams = {
        userId,
        projectId,
        optimizationType,
        analysisDepth,
      };

      const suggestions = await this.graphitiClient.optimization.analyze(analysisParams);

      return suggestions.map(suggestion => ({
        type: suggestion.type as 'memory_compression' | 'relation_pruning' | 'entity_merging' | 'temporal_archiving',
        priority: suggestion.priority as 'high' | 'medium' | 'low',
        description: suggestion.description,
        estimatedImpact: {
          memoryReduction: suggestion.estimatedImpact.memoryReduction,
          performanceGain: suggestion.estimatedImpact.performanceGain,
          accuracyImpact: suggestion.estimatedImpact.accuracyImpact,
        },
        actionRequired: suggestion.actionRequired,
      }));
    } catch (error) {
      console.error('Failed to get temporal optimization suggestions:', error);
      throw error;
    }
  }

  // 健康检查
  async healthCheck(): Promise<Record<string, any>> {
    try {
      const healthStatus = await this.graphitiClient.health.check();
      
      return {
        graphitiClient: healthStatus.status === 'healthy',
        apiConnection: healthStatus.apiConnection,
        lastResponseTime: healthStatus.lastResponseTime,
        version: healthStatus.version,
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        graphitiClient: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}