/** Content safety, privacy and source-integrity tests. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FACTS } from '../../src/data/facts';
import { GLOSSARY } from '../../src/data/glossary';
import { PERSONAS } from '../../src/data/personas';
import { OFFICIAL_DOMAINS, RESOURCES } from '../../src/data/resources';
import { buildPlan } from '../../src/domain/engine';
import { OUTCOMES } from '../../src/domain/outcomes';
import { QUESTIONS } from '../../src/domain/questions';
import type { LText } from '../../src/domain/types';
import { ALERT_TEXT, UI } from '../../src/i18n/strings';
import { FORBIDDEN_OUTPUT, guardOutput } from '../../src/lib/ai/prompts';
import { planToText } from '../../src/lib/export';

function collect(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collect(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collect(v, out));
  return out;
}

const ALL_TEXT = collect([OUTCOMES, QUESTIONS, FACTS, GLOSSARY, UI, ALERT_TEXT, PERSONAS.map((p) => [p.title, p.blurb])]);

describe('no legal verdicts or promises anywhere in user-facing content', () => {
  it.each(FORBIDDEN_OUTPUT.map((r) => [r.source, r]))('never matches %s', (_src, re) => {
    const hits = ALL_TEXT.filter((t) => (re as RegExp).test(t));
    expect(hits).toEqual([]);
  });

  it('no processing-time promises', () => {
    const hits = ALL_TEXT.filter((t) => /\b(within|in) \d+ (business )?(days|weeks|months)\b/i.test(t));
    expect(hits).toEqual([]);
  });

  it('every plan is informational, for every persona', () => {
    for (const p of PERSONAS) expect(buildPlan(p.answers).classification).toBe('informational');
  });

  it('the AI output guard rejects verdict language', () => {
    expect(() => guardOutput('Good news: you are eligible for dismissal.')).toThrow();
    expect(() => guardOutput('Your record was erased.')).toThrow();
    expect(guardOutput('Ask the Clerk for a name search.')).toBe('Ask the Clerk for a name search.');
  });
});

describe('form distinctions are correct (§17)', () => {
  const text = (l: LText) => l.en;
  it('CR-409 is the arrest-sealing petition, CR-410 its order', () => {
    const cr409 = RESOURCES.find((r) => r.id === 'form_cr409')!;
    expect(text(cr409.title)).toMatch(/Petition to Seal Arrest/);
    expect(cr409.notes).toMatch(/NOT lead to a conviction/);
    expect(text(RESOURCES.find((r) => r.id === 'form_cr410')!.title)).toMatch(/Order to Seal Arrest/);
  });
  it('CR-180/CR-181 are dismissal petition/order; MC-031 is an attached declaration', () => {
    expect(text(RESOURCES.find((r) => r.id === 'form_cr180')!.title)).toMatch(/Petition for Dismissal/);
    expect(text(RESOURCES.find((r) => r.id === 'form_cr181')!.title)).toMatch(/Order for Dismissal/);
    expect(text(RESOURCES.find((r) => r.id === 'form_mc031')!.title)).toMatch(/Attached Declaration/);
  });
  it('FW-001 is described as a general court fee waiver, distinct from DOJ', () => {
    const fw = RESOURCES.find((r) => r.id === 'form_fw001')!;
    expect(fw.notes).toMatch(/NOT the DOJ record-review fee waiver/);
  });
  it('CR-180/CR-181 forms only appear on conviction-related outcomes', () => {
    for (const o of OUTCOMES) {
      const uses = o.steps.some((s) => s.officialResources.some((r) => r === 'form_cr180' || r === 'form_cr181'));
      if (uses) expect(o.id).toBe('SC_ADULT_DISMISSAL_INFO');
    }
  });
});

describe('sources & verification integrity', () => {
  it('every link is on an official domain over https', () => {
    for (const r of RESOURCES) {
      const u = new URL(r.url);
      expect(u.protocol).toBe('https:');
      const host = u.hostname.replace(/^www\./, '');
      expect(OFFICIAL_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`)), r.url).toBe(true);
    }
  });
  it('"verified" is only claimed with a real check date', () => {
    for (const r of RESOURCES) if (r.verificationStatus === 'verified') expect(r.lastCheckedByBuild).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const f of FACTS) if (f.status === 'verified') expect(f.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('known unknowns stay unverified', () => {
    const byId = Object.fromEntries(FACTS.map((f) => [f.id, f]));
    for (const id of ['hoj_records_counter_location', 'sc_portal_login', 'sc_efiling_self_rep', 'sc_microfiche_conflict'])
      expect(byId[id].status).toBe('needs_review');
    expect(byId.sc_microfiche_conflict.conflict).toBeTruthy();
    expect(byId.sc_payee.conflict).toBeTruthy();
  });
  it('pages that blocked the automated check are not marked verified', () => {
    for (const id of ['sc_probation_clearance', 'sc_pd_post_conviction', 'fbi_ihs_faq'])
      expect(RESOURCES.find((r) => r.id === id)!.verificationStatus).toBe('needs_review');
  });
});

describe('privacy by design', () => {
  const srcFiles = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? srcFiles(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
    });
  // Strip comments so documentation that NAMES forbidden APIs doesn't count as using them.
  const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
  const code = srcFiles('src').map((f) => [f, stripComments(readFileSync(f, 'utf8'))] as const);

  it('makes no network calls and uses no storage, cookies or analytics', () => {
    for (const [f, c] of code) {
      expect(c, f).not.toMatch(/\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/);
      expect(c, f).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie/);
      expect(c, f).not.toMatch(/google-analytics|gtag\(|plausible|segment\.com|mixpanel/i);
    }
  });

  it('never logs answers', () => {
    for (const [f, c] of code) expect(c, f).not.toMatch(/console\.(log|info|debug)\([^)]*answers/);
  });

  it('asks for no free text: every question is coded choices', () => {
    for (const q of QUESTIONS) {
      expect(['single', 'multi']).toContain(q.type);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('never asks for names, birth dates, SSNs, addresses or offense narratives', () => {
    const prompts = QUESTIONS.map((q) => q.prompt.en).join('\n');
    expect(prompts).not.toMatch(/what (crime|crimes|did you do)|your (full )?name|date of birth\?|social security|your address|describe what happened/i);
    expect(QUESTIONS.find((q) => q.id === 'sc_case_number')!.help!.en).toMatch(/Don't type it here/);
  });

  it('the copied checklist contains no answer codes', () => {
    for (const p of PERSONAS) {
      const t = planToText(buildPlan(p.answers), 'en');
      for (const k of Object.keys(p.answers).filter((x) => /[_@]/.test(x))) expect(t).not.toContain(k);
      expect(t).not.toMatch(/whose_record|matter_status|immigration=|supervision=/);
    }
  });

  it('personas are fictional: answer codes only, no identifiers', () => {
    for (const p of PERSONAS) {
      for (const v of Object.values(p.answers).flat()) expect(v).toMatch(/^[a-z0-9_]+$/);
    }
  });
});
