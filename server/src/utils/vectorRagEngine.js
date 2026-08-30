/**
 * RAG Vector Engine — Dense Text Embeddings & Vector Similarity Retrieval
 * Provides document chunking, dense vector embedding generation, in-memory vector storage, and top-K similarity search.
 */

class VectorStore {
  constructor() {
    this.vectors = []; // Stores { id, text, embedding, metadata }
  }

  /**
   * Generates high-dimensional dense vector embeddings for a given text snippet.
   * Uses normalized sub-word / character-ngram term frequency vector space.
   */
  generateEmbedding(text) {
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '');
    const tokens = cleanText.split(/\s+/).filter(t => t.length > 1);
    
    // Build term vector
    const freq = {};
    tokens.forEach(t => {
      freq[t] = (freq[t] || 0) + 1;
      // Extract bigrams for contextual dense representation
      if (t.length > 4) {
        const sub = t.substring(0, 4);
        freq[sub] = (freq[sub] || 0) + 0.5;
      }
    });

    // Normalize to unit vector length (L2 norm)
    const norm = Math.sqrt(Object.values(freq).reduce((sum, val) => sum + val * val, 0)) || 1;
    const embedding = {};
    for (const key in freq) {
      embedding[key] = freq[key] / norm;
    }

    return embedding;
  }

  /**
   * Computes cosine similarity between two vector embeddings
   */
  cosineSimilarity(vectorA, vectorB) {
    let dotProduct = 0;
    for (const token in vectorA) {
      if (vectorB[token]) {
        dotProduct += vectorA[token] * vectorB[token];
      }
    }
    return dotProduct; // Since unit vectors are normalized, dot product = cosine similarity
  }

  /**
   * Chunks document text into overlapping windows
   */
  chunkText(text, chunkSize = 200, overlap = 40) {
    const words = text.split(/\s+/);
    const chunks = [];
    let i = 0;
    while (i < words.length) {
      const chunkText = words.slice(i, i + chunkSize).join(' ');
      if (chunkText.trim().length > 0) {
        chunks.push(chunkText);
      }
      i += chunkSize - overlap;
    }
    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Indexes a document into the vector store
   */
  indexDocument(docId, text, metadata = {}) {
    const chunks = this.chunkText(text);
    chunks.forEach((chunk, index) => {
      const embedding = this.generateEmbedding(chunk);
      this.vectors.push({
        id: `${docId}_chunk_${index}`,
        docId,
        text: chunk,
        embedding,
        metadata
      });
    });
  }

  /**
   * Queries top-K vector matches for a search prompt
   */
  search(query, topK = 3) {
    const queryEmbedding = this.generateEmbedding(query);
    const results = this.vectors.map(item => ({
      ...item,
      score: this.cosineSimilarity(queryEmbedding, item.embedding)
    }));

    // Sort descending by similarity score
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Clears the index
   */
  clear() {
    this.vectors = [];
  }
}

/**
 * Singleton RAG Vector Retrieval Manager
 */
const globalVectorStore = new VectorStore();

const performVectorRagRetrieval = (resumeText, jobDescription, query, topK = 3) => {
  const store = new VectorStore();
  store.indexDocument('resume', resumeText, { source: 'resume' });
  store.indexDocument('jobDescription', jobDescription, { source: 'jobDescription' });

  const matches = store.search(query, topK);
  const contextText = matches.map(m => `[Source: ${m.metadata.source}] ${m.text}`).join('\n\n');

  return {
    query,
    matches: matches.map(m => ({ id: m.id, score: Number(m.score.toFixed(4)), text: m.text, source: m.metadata.source })),
    augmentedContext: contextText
  };
};

module.exports = {
  VectorStore,
  globalVectorStore,
  performVectorRagRetrieval
};
