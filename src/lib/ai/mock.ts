import { GLOSSARY_BY_ID } from '../../data/glossary';
import { OUTCOME_BY_ID } from '../../domain/outcomes';
import type { AiAssistanceService } from './adapter';
import { guardOutput } from './prompts';

/**
 * Local, deterministic "curated" implementation used by tests and as a
 * reference for a future provider. It returns hand-written content only —
 * it does NOT call any model, and the UI labels it as curated, not AI.
 */
export class CuratedAiService implements AiAssistanceService {
  readonly mode = 'curated' as const;
  isAvailable() {
    return true;
  }
  async explainTerm(termId: string, _sourceIds: string[] = []): Promise<string> {
    const t = GLOSSARY_BY_ID[termId];
    if (!t) throw new Error(`Unknown term: ${termId}`);
    return guardOutput(`${t.term.en}: ${t.definition.en}${t.example ? ` ${t.example.en}` : ''}`);
  }
  async rephraseChecklist(outcomeId: string, _sourceIds: string[], level: 'simple' | 'standard'): Promise<string> {
    const o = OUTCOME_BY_ID[outcomeId];
    if (!o) throw new Error(`Unknown outcome: ${outcomeId}`);
    const steps = o.steps.filter((s) => !s.when && !s.optional);
    const lines = steps.map((s, i) => (level === 'simple' ? `${i + 1}. ${s.title.en}` : `${i + 1}. ${s.title.en} — ${s.instruction.en}`));
    return guardOutput(lines.join('\n'));
  }
  async clerkQuestionTemplate(outcomeId: string, _sourceIds: string[] = []): Promise<string> {
    const o = OUTCOME_BY_ID[outcomeId];
    const q = o?.clerkQuestions?.[0];
    return guardOutput(q ? q.en : 'What is the approved way to request records for my case?');
  }
}
