/**
 * Business Knowledge feature types (PROMPT-18, Spec A §6).
 *
 * Entries are the plain-text question/answer records the future AI
 * assistant will use when replying to customers — stored as JSON in
 * the canonical `Business.faqs` field (DECISIONS #13). No AI, no RAG,
 * no embeddings: content management only.
 */

/** Serializable knowledge entry view used by the management UI. */
export type KnowledgeEntryView = {
  question: string;
  answer: string;
};

export type KnowledgeActionResult =
  | { success: true; entries: KnowledgeEntryView[] }
  | { success: false; message: string };
