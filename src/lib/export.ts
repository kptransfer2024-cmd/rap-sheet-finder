import { FACT_BY_ID } from '../data/facts';
import { RESOURCE_BY_ID } from '../data/resources';
import { tr, ui, STATUS_LABEL, METHOD_LABEL, VERIFICATION_LABEL } from '../i18n/strings';
import type { Locale, Plan } from '../domain/types';

/**
 * Plain-text checklist for "Copy checklist". Contains ONLY the plan's abstract
 * steps, official links and phone numbers — never the user's answers.
 */
export function planToText(plan: Plan, locale: Locale): string {
  const lines: string[] = [];
  lines.push(`${ui('appName', locale)} — ${ui('yourPlan', locale)}`);
  lines.push(ui('badge', locale));
  lines.push('');
  plan.cards.forEach((card, ci) => {
    const head = `${ci === 0 ? `★ ${ui('startHere', locale)}: ` : ''}${tr(card.shortTitle, locale)}`;
    lines.push(head + (card.caseLabel ? ` (${tr(card.caseLabel, locale)})` : ''));
    lines.push(`   [${tr(STATUS_LABEL[card.status], locale)}]`);
    card.steps.forEach((s, i) => {
      const opt = s.optional ? `${ui('option', locale)}: ` : '';
      lines.push(`  ☐ ${i + 1}. ${opt}${tr(s.title, locale)} — ${tr(METHOD_LABEL[s.method], locale)} (${tr(VERIFICATION_LABEL[s.verificationStatus], locale)})`);
      for (const r of s.officialResources) {
        const res = RESOURCE_BY_ID[r];
        if (res) lines.push(`       ${tr(res.title, locale)}: ${res.url}`);
      }
    });
    for (const p of card.places) {
      lines.push(`  ⌂ ${tr(p.name, locale)} — ${p.streetAddress}${p.phones[0] ? ` — ${p.phones[0].number}` : ''}`);
    }
    lines.push('');
  });
  lines.push(tr({ en: 'Facts marked "Confirm" or "Needs verification" may have changed — check the official site.', es: 'Los datos marcados "Confirme" o "Requiere verificación" pueden haber cambiado.' }, locale));
  lines.push(tr(plan.primary.legalNotice, locale));
  return lines.join('\n');
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Native browser print. The print stylesheet hides answers and controls. */
export function printPlan() {
  window.print();
}

/** For the source drawer: the facts a plan relies on, grouped by status. */
export function factsInPlan(plan: Plan) {
  const ids = new Set(plan.cards.flatMap((c) => c.steps.flatMap((s) => s.factIds ?? [])));
  return [...ids].map((id) => FACT_BY_ID[id]).filter(Boolean);
}
