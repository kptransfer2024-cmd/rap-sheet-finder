import { useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlossaryDialog } from './components/Glossary';
import { Header } from './components/Header';
import { Results } from './components/Results';
import { Welcome } from './components/Welcome';
import { Wizard } from './components/Wizard';
import { PERSONAS } from './data/personas';
import { setAnswer, walk } from './domain/engine';
import type { AnswerValue, Answers, Locale, QuestionInstance } from './domain/types';
import { tr, ui } from './i18n/strings';

type View = 'welcome' | 'wizard' | 'results';

/**
 * App shell + navigation state machine.
 * State lives in memory only: no localStorage, cookies, analytics or network.
 * Refreshing or closing the tab discards every answer.
 */
export default function App() {
  const [view, setView] = useState<View>('welcome');
  const [answers, setAnswers] = useState<Answers>({});
  const [editingKey, setEditingKey] = useState<string | undefined>();
  const [returnToResults, setReturnToResults] = useState(false);
  const [locale, setLocale] = useState<Locale>('en');
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [glossary, setGlossary] = useState<{ open: boolean; term?: string }>({ open: false });
  const [announcement, setAnnouncement] = useState('');

  // Display preferences + document language.
  useEffect(() => {
    const el = document.documentElement;
    el.lang = locale;
    el.dataset.text = largeText ? 'large' : 'normal';
    el.dataset.contrast = highContrast ? 'high' : 'normal';
  }, [locale, largeText, highContrast]);

  // Print: expand disclosures marked print-open, restore afterwards.
  useEffect(() => {
    const opened: HTMLDetailsElement[] = [];
    const before = () => {
      document.querySelectorAll<HTMLDetailsElement>('details.print-open:not([open])').forEach((d) => {
        d.open = true;
        opened.push(d);
      });
    };
    const after = () => {
      opened.splice(0).forEach((d) => (d.open = false));
    };
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);

  const goto = useCallback((v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  }, []);

  const announceQuestion = (next: Answers, key?: string) => {
    const w = walk(next, 'pending');
    const inst = (key && w.instances.find((x) => x.key === key)) || w.firstPending;
    if (inst) setAnnouncement(tr(inst.node.prompt, locale));
  };

  const clearAll = () => {
    setAnswers({});
    setEditingKey(undefined);
    setReturnToResults(false);
    setAnnouncement(ui('cleared', locale));
    goto('welcome');
  };

  const start = (whose: 'own' | 'helping' | 'someone_else') => {
    const next = { whose_record: whose };
    setAnswers(next);
    setEditingKey(undefined);
    setReturnToResults(false);
    if (whose === 'someone_else') {
      setAnnouncement(ui('yourPlan', locale));
      goto('results');
    } else {
      announceQuestion(next);
      goto('wizard');
    }
  };

  const loadPersona = (id: string) => {
    const p = PERSONAS.find((x) => x.id === id);
    if (!p) return;
    setAnswers({ ...p.answers });
    setEditingKey(undefined);
    setReturnToResults(false);
    setAnnouncement(ui('yourPlan', locale));
    goto('results');
  };

  const answer = (key: string, value: AnswerValue) => {
    const next = setAnswer(answers, key, value);
    setAnswers(next);
    const w = walk(next, 'pending');
    const applicable = w.instances.filter((x) => x.applicable);

    if (returnToResults && !w.firstPending) {
      setEditingKey(undefined);
      setReturnToResults(false);
      setAnnouncement(ui('yourPlan', locale));
      goto('results');
      return;
    }
    if (editingKey && !returnToResults) {
      // Step forward through previously answered questions after a "Back".
      const idx = applicable.findIndex((x) => x.key === key);
      const following = applicable[idx + 1];
      if (following && following.answered) {
        setEditingKey(following.key);
        announceQuestion(next, following.key);
        return;
      }
    }
    setEditingKey(undefined);
    if (!w.firstPending) {
      setAnnouncement(ui('yourPlan', locale));
      goto('results');
    } else {
      announceQuestion(next);
    }
  };

  const skip = (inst: QuestionInstance) => {
    answer(inst.key, inst.node.type === 'multi' ? [inst.node.unknownCode] : inst.node.unknownCode);
  };

  const back = (fromKey: string) => {
    const applicable = walk(answers, 'pending').instances.filter((x) => x.applicable);
    const idx = applicable.findIndex((x) => x.key === fromKey);
    const prev = idx > 0 ? applicable[idx - 1] : undefined;
    if (!prev || prev.key === 'whose_record') {
      setEditingKey(undefined);
      goto('welcome');
      return;
    }
    setReturnToResults(false);
    setEditingKey(prev.key);
    announceQuestion(answers, prev.key);
  };

  const editFromWizard = (key: string) => {
    if (key === 'whose_record') return goto('welcome');
    setReturnToResults(false);
    setEditingKey(key);
    announceQuestion(answers, key);
  };

  const editFromResults = (key: string) => {
    if (key === 'whose_record') return goto('welcome');
    setReturnToResults(true);
    setEditingKey(key);
    announceQuestion(answers, key);
    goto('wizard');
  };

  const changeAnswers = () => {
    const first = walk(answers, 'pending').instances.find((x) => x.applicable && x.key !== 'whose_record');
    if (!first) return goto('welcome');
    setReturnToResults(false);
    setEditingKey(first.key);
    announceQuestion(answers, first.key);
    goto('wizard');
  };

  const hasAnswers = Object.keys(answers).length > 0;

  return (
    <>
      <a href="#main" className="skip-link">
        {ui('skipToContent', locale)}
      </a>
      <Header
        locale={locale}
        onLocale={setLocale}
        largeText={largeText}
        onLargeText={setLargeText}
        highContrast={highContrast}
        onHighContrast={setHighContrast}
        onGlossary={() => setGlossary({ open: true })}
        onClear={clearAll}
        onHome={() => goto('welcome')}
        canClear={hasAnswers}
      />
      <main id="main" className="mx-auto w-full max-w-[1180px] px-4 pt-8 pb-16 sm:px-6">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </div>
        <ErrorBoundary locale={locale} onReset={clearAll}>
          {view === 'welcome' && <Welcome locale={locale} onStart={start} onPersona={loadPersona} />}
          {view === 'wizard' && (
            <Wizard
              answers={answers}
              editingKey={editingKey}
              locale={locale}
              onAnswer={answer}
              onSkip={skip}
              onBack={back}
              onEdit={editFromWizard}
              onShowPlan={() => {
                setEditingKey(undefined);
                setReturnToResults(false);
                setAnnouncement(ui('yourPlan', locale));
                goto('results');
              }}
              onOpenTerm={(term) => setGlossary({ open: true, term })}
            />
          )}
          {view === 'results' && (
            <Results answers={answers} locale={locale} onEdit={editFromResults} onChangeAnswers={changeAnswers} onStartOver={clearAll} />
          )}
        </ErrorBoundary>
      </main>
      <footer className="site-footer border-t border-[var(--color-line)]">
        <div className="mx-auto max-w-[1180px] px-4 py-6 text-sm text-[var(--color-ink-soft)] sm:px-6">
          <p className="m-0">{ui('disclaimerShort', locale)}</p>
          <p className="m-0 mt-1">{ui('footer', locale)}</p>
        </div>
      </footer>
      <GlossaryDialog open={glossary.open} focusTerm={glossary.term} onClose={() => setGlossary({ open: false })} locale={locale} />
    </>
  );
}
