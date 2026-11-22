import type { AiAssistanceService } from './adapter';

/** Safe default. The app is fully functional with this service. */
export class DisabledAiService implements AiAssistanceService {
  readonly mode = 'disabled' as const;
  isAvailable() {
    return false;
  }
  async explainTerm(): Promise<string> {
    throw new Error('AI assistance is disabled. Use the curated glossary.');
  }
  async rephraseChecklist(): Promise<string> {
    throw new Error('AI assistance is disabled.');
  }
  async clerkQuestionTemplate(): Promise<string> {
    throw new Error('AI assistance is disabled. Use the curated clerk questions.');
  }
}
