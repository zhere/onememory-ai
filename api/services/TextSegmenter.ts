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
  semanticThreshold?: number;
  minChunkSize?: number;
  maxChunkSize?: number;
  separators?: string[];
}

export class TextSegmenter {
  constructor() {}

  async segmentText(
    text: string,
    options: SegmentationOptions = { strategy: 'semantic' }
  ): Promise<TextSegment[]> {
    const {
      strategy = 'semantic',
      maxTokens = 512,
      overlap = 50,
      preserveStructure = true,
      splitBySentence = true,
      splitByParagraph = true,
      customSeparators = [],
      semanticThreshold = 0.7,
      minChunkSize = 100,
      maxChunkSize = 2000,
      separators = ['\n\n', '\n', '. ', '! ', '? '],
    } = options;

    try {
      switch (strategy) {
        case 'fixed':
          return this.fixedSizeSegmentation(text, maxTokens, overlap, minChunkSize, maxChunkSize);
        case 'semantic':
          return this.semanticSegmentation(text, maxTokens, overlap, {
            preserveStructure,
            splitBySentence,
            splitByParagraph,
            semanticThreshold,
            minChunkSize,
            maxChunkSize,
            separators,
            customSeparators,
          });
        case 'adaptive':
          return this.adaptiveSegmentation(text, maxTokens, overlap, minChunkSize, maxChunkSize, semanticThreshold);
        case 'hybrid':
          return this.hybridSegmentation(text, maxTokens, overlap, {
            preserveStructure,
            splitBySentence,
            splitByParagraph,
            semanticThreshold,
            minChunkSize,
            maxChunkSize,
            separators,
            customSeparators,
          });
        default:
          throw new Error(`Unknown segmentation strategy: ${strategy}`);
      }
    } catch (error) {
      console.error('❌ Failed to segment text:', error);
      // Fallback to simple fixed segmentation
      return this.fixedSizeSegmentation(text, maxTokens, overlap, minChunkSize, maxChunkSize);
    }
  }

  private fixedSizeSegmentation(
    text: string,
    maxTokens: number,
    overlap: number,
    minChunkSize: number,
    maxChunkSize: number
  ): TextSegment[] {
    const segments: TextSegment[] = [];
    const words = text.split(/\s+/);
    const tokensPerWord = 1.3; // Approximate tokens per word
    const wordsPerChunk = Math.floor(maxTokens / tokensPerWord);
    const overlapWords = Math.floor(overlap / tokensPerWord);
    const minWordsPerChunk = Math.ceil(minChunkSize / tokensPerWord);

    for (let i = 0; i < words.length; i += wordsPerChunk - overlapWords) {
      const chunkWords = words.slice(i, i + wordsPerChunk);
      const content = chunkWords.join(' ');
      const estimatedTokens = this.estimateTokenCount(content);
      
      if (content.trim() && estimatedTokens >= minChunkSize) {
        segments.push({
          content: content.trim(),
          tokenCount: estimatedTokens,
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
      semanticThreshold: number;
      minChunkSize: number;
      maxChunkSize: number;
      separators: string[];
      customSeparators: string[];
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
      // Then split by sentences if enabled, considering custom separators
      let sentences: string[] = [];
      if (options.splitBySentence) {
        sentences = this.splitIntoSentences(chunk, options.customSeparators);
      } else {
        sentences = [chunk];
      }

      // Group sentences into segments
      let currentSegment = '';
      let currentTokens = 0;

      for (const sentence of sentences) {
        const sentenceTokens = this.estimateTokenCount(sentence);
        
        if (currentTokens + sentenceTokens > maxTokens && currentSegment) {
          // Save current segment if it meets the minimum size requirement
          if (currentTokens >= options.minChunkSize) {
            segments.push({
              content: currentSegment.trim(),
              tokenCount: currentTokens,
              importance: this.calculateImportance(currentSegment),
            });
          }

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

      // Add remaining segment if it meets the minimum size requirement
      if (currentSegment.trim() && currentTokens >= options.minChunkSize) {
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
    overlap: number,
    minChunkSize: number,
    maxChunkSize: number,
    semanticThreshold: number
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
      const finalMaxTokens = Math.min(adjustedMaxTokens, maxChunkSize);
      
      if (currentTokens + sentenceTokens > finalMaxTokens && currentSegment) {
        // Save current segment if it meets the minimum size requirement
        if (currentTokens >= minChunkSize) {
          segments.push({
            content: currentSegment.trim(),
            tokenCount: currentTokens,
            importance: this.calculateImportance(currentSegment),
            metadata: { complexity: this.calculateComplexity(currentSegment) },
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
          // If the segment is too small, continue adding to it
          currentSegment += (currentSegment ? ' ' : '') + sentence;
          currentTokens += sentenceTokens;
        }
      } else {
        currentSegment += (currentSegment ? ' ' : '') + sentence;
        currentTokens += sentenceTokens;
      }
    }

    // Add remaining segment if it meets the minimum size requirement
    if (currentSegment.trim() && currentTokens >= minChunkSize) {
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
    overlap: number,
    options: {
      preserveStructure: boolean;
      splitBySentence: boolean;
      splitByParagraph: boolean;
      semanticThreshold: number;
      minChunkSize: number;
      maxChunkSize: number;
      separators: string[];
      customSeparators: string[];
    }
  ): TextSegment[] {
    // Combine semantic and adaptive approaches
    const semanticSegments = this.semanticSegmentation(text, maxTokens, overlap, options);

    // Further refine based on complexity
    const refinedSegments: TextSegment[] = [];
    
    for (const segment of semanticSegments) {
      const complexity = this.calculateComplexity(segment.content);
      
      if (complexity > 0.7 && segment.tokenCount > maxTokens * 0.8) {
        // Split complex segments further
        const subSegments = this.adaptiveSegmentation(
          segment.content,
          Math.floor(maxTokens * 0.7),
          overlap,
          options.minChunkSize,
          options.maxChunkSize,
          options.semanticThreshold
        );
        refinedSegments.push(...subSegments);
      } else {
        refinedSegments.push(segment);
      }
    }

    return refinedSegments;
  }

  private splitIntoSentences(text: string, customDelimiters: string[] = []): string[] {
    // Combine default delimiters with custom ones
    const defaultDelimiters = /[.!?]+/;
    let sentences: string[] = [text];

    // First split with default delimiters
    sentences = text
      .split(defaultDelimiters)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Then apply custom delimiters if provided
    if (customDelimiters.length > 0) {
      const customSplitSentences: string[] = [];
      
      for (const sentence of sentences) {
        let currentParts = [sentence];
        
        for (const delimiter of customDelimiters) {
          const escapedDelimiter = delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const delimiterRegex = new RegExp(escapedDelimiter, 'g');
          
          const newParts: string[] = [];
          for (const part of currentParts) {
            const splitParts = part.split(delimiterRegex)
              .map(p => p.trim())
              .filter(p => p.length > 0);
            newParts.push(...splitParts);
          }
          
          currentParts = newParts;
        }
        
        customSplitSentences.push(...currentParts);
      }
      
      sentences = customSplitSentences;
    }

    // Add back a period to each sentence for proper formatting
    return sentences.map(s => s + '.');
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
      avgComplexity: number;
    };
  }> {
    const segments = await this.segmentText(text, options);
    
    const stats = {
      totalSegments: segments.length,
      avgTokensPerSegment: segments.length > 0 ? segments.reduce((sum, s) => sum + s.tokenCount, 0) / segments.length : 0,
      avgImportance: segments.length > 0 ? segments.reduce((sum, s) => sum + (s.importance || 0), 0) / segments.length : 0,
      totalTokens: segments.reduce((sum, s) => sum + s.tokenCount, 0),
      avgComplexity: segments.length > 0 ? segments.reduce((sum, s) => sum + (this.calculateComplexity(s.content) || 0), 0) / segments.length : 0,
    };

    return { segments, stats };
  }
}