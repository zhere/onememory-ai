import { memoryConfig } from '../config';

export interface TextSegment {
  content: string;
  tokenCount: number;
  importance?: number;
  metadata?: Record<string, any>;
}

export interface SegmentationOptions {
  strategy: 'fixed' | 'semantic' | 'adaptive' | 'hybrid';
  maxTokens?: number;
  overlap?: number;
  preserveStructure?: boolean;
  splitBySentence?: boolean;
  splitByParagraph?: boolean;
  customSeparators?: string[];
}

export class TextSegmenter {
  constructor() {}

  async segmentText(
    text: string,
    options: SegmentationOptions = { strategy: 'semantic' }
  ): Promise<TextSegment[]> {
    const {
      strategy = 'semantic',
      maxTokens = memoryConfig.maxChunkSize,
      overlap = memoryConfig.overlapSize,
      preserveStructure = true,
      splitBySentence = true,
      splitByParagraph = true,
      customSeparators = [],
    } = options;

    try {
      switch (strategy) {
        case 'fixed':
          return this.fixedSizeSegmentation(text, maxTokens, overlap);
        case 'semantic':
          return this.semanticSegmentation(text, maxTokens, overlap, {
            preserveStructure,
            splitBySentence,
            splitByParagraph,
          });
        case 'adaptive':
          return this.adaptiveSegmentation(text, maxTokens, overlap);
        case 'hybrid':
          return this.hybridSegmentation(text, maxTokens, overlap);
        default:
          throw new Error(`Unknown segmentation strategy: ${strategy}`);
      }
    } catch (error) {
      console.error('❌ Failed to segment text:', error);
      // Fallback to simple fixed segmentation
      return this.fixedSizeSegmentation(text, maxTokens, overlap);
    }
  }

  private fixedSizeSegmentation(
    text: string,
    maxTokens: number,
    overlap: number
  ): TextSegment[] {
    const segments: TextSegment[] = [];
    const words = text.split(/\s+/);
    const tokensPerWord = 1.3; // Approximate tokens per word
    const wordsPerChunk = Math.floor(maxTokens / tokensPerWord);
    const overlapWords = Math.floor(overlap / tokensPerWord);

    for (let i = 0; i < words.length; i += wordsPerChunk - overlapWords) {
      const chunkWords = words.slice(i, i + wordsPerChunk);
      const content = chunkWords.join(' ');
      
      if (content.trim()) {
        segments.push({
          content: content.trim(),
          tokenCount: this.estimateTokenCount(content),
          importance: 0.5,
        });
      }
    }

    return segments;
  }

  private semanticSegmentation(
    text: string,
    maxTokens: number,
    overlap: number,
    options: {
      preserveStructure: boolean;
      splitBySentence: boolean;
      splitByParagraph: boolean;
    }
  ): TextSegment[] {
    const segments: TextSegment[] = [];
    
    // First, split by paragraphs if enabled
    let chunks: string[] = [];
    if (options.splitByParagraph) {
      chunks = text.split(/\n\s*\n/).filter(chunk => chunk.trim());
    } else {
      chunks = [text];
    }

    for (const chunk of chunks) {
      // Then split by sentences if enabled
      let sentences: string[] = [];
      if (options.splitBySentence) {
        sentences = this.splitIntoSentences(chunk);
      } else {
        sentences = [chunk];
      }

      // Group sentences into segments
      let currentSegment = '';
      let currentTokens = 0;

      for (const sentence of sentences) {
        const sentenceTokens = this.estimateTokenCount(sentence);
        
        if (currentTokens + sentenceTokens > maxTokens && currentSegment) {
          // Save current segment
          segments.push({
            content: currentSegment.trim(),
            tokenCount: currentTokens,
            importance: this.calculateImportance(currentSegment),
          });

          // Start new segment with overlap
          if (overlap > 0) {
            const overlapText = this.getOverlapText(currentSegment, overlap);
            currentSegment = overlapText + ' ' + sentence;
            currentTokens = this.estimateTokenCount(currentSegment);
          } else {
            currentSegment = sentence;
            currentTokens = sentenceTokens;
          }
        } else {
          currentSegment += (currentSegment ? ' ' : '') + sentence;
          currentTokens += sentenceTokens;
        }
      }

      // Add remaining segment
      if (currentSegment.trim()) {
        segments.push({
          content: currentSegment.trim(),
          tokenCount: currentTokens,
          importance: this.calculateImportance(currentSegment),
        });
      }
    }

    return segments;
  }

  private adaptiveSegmentation(
    text: string,
    maxTokens: number,
    overlap: number
  ): TextSegment[] {
    // Adaptive segmentation adjusts chunk size based on content complexity
    const segments: TextSegment[] = [];
    const sentences = this.splitIntoSentences(text);
    
    let currentSegment = '';
    let currentTokens = 0;

    for (const sentence of sentences) {
      const sentenceTokens = this.estimateTokenCount(sentence);
      const complexity = this.calculateComplexity(sentence);
      
      // Adjust max tokens based on complexity
      const adjustedMaxTokens = Math.floor(maxTokens * (1 - complexity * 0.3));
      
      if (currentTokens + sentenceTokens > adjustedMaxTokens && currentSegment) {
        segments.push({
          content: currentSegment.trim(),
          tokenCount: currentTokens,
          importance: this.calculateImportance(currentSegment),
          metadata: { complexity: this.calculateComplexity(currentSegment) },
        });

        // Start new segment
        currentSegment = sentence;
        currentTokens = sentenceTokens;
      } else {
        currentSegment += (currentSegment ? ' ' : '') + sentence;
        currentTokens += sentenceTokens;
      }
    }

    if (currentSegment.trim()) {
      segments.push({
        content: currentSegment.trim(),
        tokenCount: currentTokens,
        importance: this.calculateImportance(currentSegment),
        metadata: { complexity: this.calculateComplexity(currentSegment) },
      });
    }

    return segments;
  }

  private hybridSegmentation(
    text: string,
    maxTokens: number,
    overlap: number
  ): TextSegment[] {
    // Combine semantic and adaptive approaches
    const semanticSegments = this.semanticSegmentation(text, maxTokens, overlap, {
      preserveStructure: true,
      splitBySentence: true,
      splitByParagraph: true,
    });

    // Further refine based on complexity
    const refinedSegments: TextSegment[] = [];
    
    for (const segment of semanticSegments) {
      const complexity = this.calculateComplexity(segment.content);
      
      if (complexity > 0.7 && segment.tokenCount > maxTokens * 0.8) {
        // Split complex segments further
        const subSegments = this.adaptiveSegmentation(
          segment.content,
          Math.floor(maxTokens * 0.7),
          overlap
        );
        refinedSegments.push(...subSegments);
      } else {
        refinedSegments.push(segment);
      }
    }

    return refinedSegments;
  }

  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting - could be enhanced with NLP libraries
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => s + '.');
  }

  private estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 0.75 words
    const words = text.split(/\s+/).length;
    return Math.ceil(words * 1.3);
  }

  private calculateImportance(text: string): number {
    // Simple importance calculation based on various factors
    let importance = 0.5; // Base importance

    // Length factor
    const length = text.length;
    if (length > 500) importance += 0.1;
    if (length > 1000) importance += 0.1;

    // Keyword density
    const keywords = ['important', 'key', 'critical', 'essential', 'main', 'primary'];
    const keywordCount = keywords.reduce((count, keyword) => {
      return count + (text.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
    }, 0);
    importance += Math.min(keywordCount * 0.05, 0.2);

    // Question marks (often indicate important information)
    const questionCount = (text.match(/\?/g) || []).length;
    importance += Math.min(questionCount * 0.02, 0.1);

    // Numbers and dates (often important)
    const numberCount = (text.match(/\d+/g) || []).length;
    importance += Math.min(numberCount * 0.01, 0.1);

    return Math.min(importance, 1.0);
  }

  private calculateComplexity(text: string): number {
    // Calculate text complexity based on various factors
    let complexity = 0;

    // Average word length
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    complexity += Math.min(avgWordLength / 10, 0.3);

    // Sentence length
    const sentences = this.splitIntoSentences(text);
    const avgSentenceLength = words.length / sentences.length;
    complexity += Math.min(avgSentenceLength / 30, 0.3);

    // Technical terms (words with many syllables or special characters)
    const technicalWords = words.filter(word => 
      word.length > 8 || /[A-Z]{2,}/.test(word) || /\d/.test(word)
    );
    complexity += Math.min(technicalWords.length / words.length, 0.4);

    return Math.min(complexity, 1.0);
  }

  private getOverlapText(text: string, overlapTokens: number): string {
    const words = text.split(/\s+/);
    const overlapWords = Math.floor(overlapTokens / 1.3); // Approximate
    return words.slice(-overlapWords).join(' ');
  }

  // Utility method for testing segmentation
  async testSegmentation(
    text: string,
    options: SegmentationOptions
  ): Promise<{
    segments: TextSegment[];
    stats: {
      totalSegments: number;
      avgTokensPerSegment: number;
      avgImportance: number;
      totalTokens: number;
    };
  }> {
    const segments = await this.segmentText(text, options);
    
    const stats = {
      totalSegments: segments.length,
      avgTokensPerSegment: segments.reduce((sum, s) => sum + s.tokenCount, 0) / segments.length,
      avgImportance: segments.reduce((sum, s) => sum + (s.importance || 0), 0) / segments.length,
      totalTokens: segments.reduce((sum, s) => sum + s.tokenCount, 0),
    };

    return { segments, stats };
  }
}