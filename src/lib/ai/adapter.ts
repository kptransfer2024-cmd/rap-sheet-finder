/**
 * OPTIONAL future AI explanation helper — interface only.
 *
 * Hard boundaries (master prompt §11):
 *  - AI never decides routing. It cannot change rule-engine outcomes, status labels,
 *    verification flags or official links. It only REPHRASES approved content.
 *  - Inputs are limited to ids (term ids, outcome ids, source ids) and the curated
 *    text those ids point to. No user answers, names, dates or case facts are sent.
 *  - A real provider must run server-side (never a key in the client bundle),
 *    allow-list cited source snippets, log without identifying facts, defend
 *    against prompt injection, and pass output checks (see prompts.ts guardOutput).
 *  - The UI must never imply a model call happened when it didn't.
 */
export interface AiAssistanceService {
  /** 'disabled' = no AI; 'curated' = deterministic hand-written content; 'remote' = future server-side model. */
  readonly mode: 'disabled' | 'curated' | 'remote';
  isAvailable(): boolean;
  explainTerm(termId: string, sourceIds: string[]): Promise<string>;
  rephraseChecklist(outcomeId: string, sourceIds: string[], level: 'simple' | 'standard'): Promise<string>;
  clerkQuestionTemplate(outcomeId: string, sourceIds: string[]): Promise<string>;
}
