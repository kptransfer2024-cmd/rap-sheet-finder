import type { AiAssistanceService } from './adapter';
import { DisabledAiService } from './disabled';

/**
 * The app always uses the disabled service. To experiment with a future provider,
 * implement AiAssistanceService behind a SERVER route and wire it here — never
 * read an API key from a VITE_* variable (it would ship in the client bundle).
 */
export const aiService: AiAssistanceService = new DisabledAiService();
export type { AiAssistanceService };
