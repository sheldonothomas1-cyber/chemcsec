// The tutor can run on more than one AI provider. This file lists them, stores the learner's
// choice and keys (apart from study data, so a backup file never contains a key), and hands
// the chat screen one uniform session to talk to.
import { createClaudeSession, explainClaudeError, MODELS as CLAUDE_MODELS } from './claude';
import { createGeminiSession, explainGeminiError, GEMINI_MODELS } from './gemini';
import type { TutorModel, TutorSession } from './types';

export type ProviderId = 'gemini' | 'claude';

export interface Provider {
  id: ProviderId;
  name: string;
  company: string;
  free: boolean;
  summary: string;
  keyLabel: string;
  keyUrl: string;
  keySite: string;
  keySteps: string;
  privacy: string;
  models: TutorModel[];
}

export const PROVIDERS: Provider[] = [
  {
    id: 'gemini', name: 'Gemini', company: 'Google', free: true,
    summary: 'Free. Good for everyday tutoring, with a daily limit on how many questions you can ask.',
    keyLabel: 'Gemini API key', keyUrl: 'https://aistudio.google.com/apikey', keySite: 'aistudio.google.com/apikey',
    keySteps: 'Sign in with a Google account, press "Create API key" and copy it. No payment card is needed.',
    privacy: 'On the free tier Google may use what you type to improve its products, so never type personal details such as your full name, school or address.',
    models: GEMINI_MODELS,
  },
  {
    id: 'claude', name: 'Claude', company: 'Anthropic', free: false,
    summary: 'Paid by use. The strongest explanations, with no daily limit.',
    keyLabel: 'Anthropic API key', keyUrl: 'https://platform.claude.com', keySite: 'platform.claude.com',
    keySteps: 'Create a key, add a small amount of credit, and set a monthly spend limit.',
    privacy: 'Your questions are sent to Anthropic to be answered.',
    models: CLAUDE_MODELS,
  },
];
export const providerById = (id: string): Provider => PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
export const modelFor = (provider: Provider, id: string | undefined): TutorModel => provider.models.find((m) => m.id === id) ?? provider.models[0];

// ---------- settings ----------
const KEY = 'chemcsec:tutor';
export interface TutorSettings {
  provider: ProviderId;
  keys: Record<ProviderId, string>;
  models: Record<ProviderId, string>;
}
const defaults = (): TutorSettings => ({
  provider: 'gemini',
  keys: { gemini: '', claude: '' },
  models: { gemini: GEMINI_MODELS[0].id, claude: CLAUDE_MODELS[0].id },
});

export function loadSettings(): TutorSettings {
  const out = defaults();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    const str = (v: unknown) => (typeof v === 'string' ? v : '');
    if (typeof raw.apiKey === 'string') {
      // Settings saved before Gemini was added held a single Claude key.
      out.keys.claude = raw.apiKey;
      out.models.claude = modelFor(providerById('claude'), raw.model).id;
      if (raw.apiKey) out.provider = 'claude';
      return out;
    }
    for (const p of PROVIDERS) {
      out.keys[p.id] = str(raw.keys?.[p.id]);
      out.models[p.id] = modelFor(p, raw.models?.[p.id]).id;
    }
    if (raw.provider === 'claude' || raw.provider === 'gemini') out.provider = raw.provider;
  } catch {
    // Unreadable settings: fall back to the defaults.
  }
  return out;
}

export function saveSettings(s: TutorSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Storage unavailable: the key simply will not be remembered.
  }
}

export const activeKey = (s: TutorSettings) => s.keys[s.provider];
export const activeModel = (s: TutorSettings) => modelFor(providerById(s.provider), s.models[s.provider]);

export function createSession(s: TutorSettings): TutorSession {
  const model = activeModel(s);
  return s.provider === 'gemini' ? createGeminiSession(s.keys.gemini, model) : createClaudeSession(s.keys.claude, model);
}

export function explainError(provider: ProviderId, err: unknown, aborted: boolean): string {
  return provider === 'gemini' ? explainGeminiError(err, aborted) : explainClaudeError(err);
}
