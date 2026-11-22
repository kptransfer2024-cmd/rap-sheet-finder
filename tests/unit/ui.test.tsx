/** UI behaviour in jsdom: keyboard-only flow (§14 #29), back/edit, clear, language. */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../../src/App';

const heading = () => screen.getAllByRole('heading', { level: 2 })[0];

async function tabTo(user: ReturnType<typeof userEvent.setup>, match: (el: Element) => boolean, max = 60) {
  for (let i = 0; i < max; i++) {
    await user.tab();
    if (document.activeElement && match(document.activeElement)) return document.activeElement;
  }
  throw new Error('Could not reach element by keyboard');
}

describe('wizard UI', () => {
  it('completes Example 1 with the keyboard only and shows the index route', async () => {
    const user = userEvent.setup();
    render(<App />);
    await tabTo(user, (el) => el.textContent?.includes("Start — it's my own record") ?? false);
    await user.keyboard('{Enter}');
    expect(heading()).toHaveTextContent('What are you trying to do today?');

    // Tab into the option group, move with arrow keys (radios) or Tab (checkboxes), Enter submits.
    const choose = async (label: RegExp) => {
      const target = screen.getByLabelText(label);
      await tabTo(user, (el) => el.getAttribute('type') === 'radio' || el.getAttribute('type') === 'checkbox');
      for (let i = 0; i < 12 && document.activeElement !== target; i++) {
        if ((document.activeElement as HTMLInputElement).type === 'radio') await user.keyboard('{ArrowDown}');
        else await user.tab();
      }
      expect(document.activeElement).toBe(target);
      // Space selects a focused radio (Tab into an empty group focuses without selecting) or toggles a checkbox.
      if (!(target as HTMLInputElement).checked) await user.keyboard(' ');
      expect(target).toBeChecked();
      await user.keyboard('{Enter}');
    };

    await choose(/Find my case number/);
    expect(heading()).toHaveTextContent('Where was the case or arrest handled?');
    await choose(/^Santa Clara County court$/);
    expect(heading()).toHaveTextContent('How many Santa Clara County cases');
    await choose(/^One case$/);
    expect(heading()).toHaveTextContent('Do you know the court case number?');
    await choose(/^No$/);
    expect(heading()).toHaveTextContent('About when was the case filed?');
    await choose(/^2004 or later$/);
    expect(heading()).toHaveTextContent('Have you already tried');
    await choose(/^Not yet$/);
    expect(heading()).toHaveTextContent('What would make this easier for you?');
    await tabTo(user, (el) => el.textContent === 'Skip this question');
    await user.keyboard('{Enter}');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your plan');
    const primary = document.querySelector('[data-primary="true"]') as HTMLElement;
    expect(primary.getAttribute('data-outcome')).toBe('SC_INDEX_LOOKUP');
    expect(within(primary).getAllByRole('heading', { level: 3 })[0]).toHaveTextContent("Start with Santa Clara's official case index");
    expect(document.querySelector('[data-outcome="SC_MULTI_CA_DOJ_OPTION"]')).toBeNull();
    expect(document.querySelector('[data-outcome="MULTISTATE_FBI_OPTION"]')).toBeNull();
  });

  it('Back re-opens the previous answer; editing it clears now-irrelevant answers', async () => {
    const user = userEvent.setup();
    render(<App />);
    const next = () => user.click(screen.getByRole('button', { name: /Continue/ }));
    await user.click(screen.getByRole('button', { name: /Start — it's my own record/ }));
    await user.click(screen.getByLabelText(/Find my case number/));
    await next();
    await user.click(screen.getByLabelText(/^Santa Clara County court$/));
    await next();
    await user.click(screen.getByLabelText(/^One case$/));
    await next();
    await user.click(screen.getByLabelText(/^No$/));
    await next();
    await user.click(screen.getByLabelText(/^Before 2004$/));
    await next();
    await user.click(screen.getByRole('button', { name: /Back/ }));
    expect(heading()).toHaveTextContent('About when was the case filed?');
    expect(screen.getByLabelText(/^Before 2004$/)).toBeChecked();
    await user.click(screen.getByRole('button', { name: /Back/ }));
    expect(heading()).toHaveTextContent('Do you know the court case number?');
    await user.click(screen.getByLabelText(/^Yes, I have it$/));
    await next();
    expect(heading()).toHaveTextContent("You already have the number. What's still missing?");
    const answersPanel = screen.getByRole('progressbar').closest('section') as HTMLElement;
    expect(within(answersPanel).queryByText('Before 2004')).toBeNull();
  });

  it('"Clear my answers" empties everything and returns to the start', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Start — it's my own record/ }));
    await user.click(screen.getByLabelText(/Get copies of court documents/));
    await user.click(screen.getByRole('button', { name: /Continue/ }));
    await user.click(screen.getByRole('button', { name: /Clear my answers/ }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Let's find the easiest practical next step.");
    expect(screen.queryByRole('button', { name: /Clear my answers/ })).toBeNull();
    expect(screen.getByText('Your answers were cleared.')).toBeInTheDocument();
  });

  it('every question screen offers a "not sure"-type option and a Why-we-ask panel', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Start — it's my own record/ }));
    for (let i = 0; i < 12; i++) {
      if (screen.queryByRole('heading', { level: 1, name: 'Your plan' })) break;
      const form = heading().closest('form') as HTMLElement;
      expect(within(form).getByText('Why we ask')).toBeInTheDocument();
      expect(form.querySelector('.option.unknown')).not.toBeNull();
      await user.click(form.querySelector('.option.unknown input') as HTMLInputElement);
      await user.click(within(form).getByRole('button', { name: /Continue/ }));
    }
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your plan');
  });

  it('switches to Spanish', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Español' }));
    expect(document.documentElement.lang).toBe('es');
    await user.click(screen.getByRole('button', { name: /Empezar/ }));
    expect(heading()).toHaveTextContent('¿Qué quiere hacer hoy?');
  });

  it('example personas open a plan with an inspectable rule trace', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(document.querySelector('[data-persona="H"]') as HTMLElement);
    expect(document.querySelector('[data-primary="true"]')!.getAttribute('data-outcome')).toBe('ACTIVE_CASE_LEGAL_HELP');
    expect(screen.getByTestId('rule-trace').textContent).toMatch(/R-ACTIVE-SUPERVISION/);
    expect(screen.getByText(/research demonstration providing general information, not legal advice/)).toBeInTheDocument();
  });

  it('"Looking up someone else?" leads to the not-supported outcome', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Looking up someone else/ }));
    expect(document.querySelector('[data-primary="true"]')!.getAttribute('data-outcome')).toBe('THIRD_PARTY_NOT_SUPPORTED');
  });

  it('external links are labelled as leaving the app', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(document.querySelector('[data-persona="B"]') as HTMLElement);
    const links = [...document.querySelectorAll('a[target="_blank"]')];
    expect(links.length).toBeGreaterThan(3);
    for (const a of links) {
      expect(a.getAttribute('rel')).toContain('noopener');
      expect(a.textContent).toMatch(/new tab/);
    }
  });
});
