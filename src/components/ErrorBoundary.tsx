import { Component, type ReactNode } from 'react';
import type { Locale } from '../domain/types';
import { ui } from '../i18n/strings';

interface Props {
  locale: Locale;
  onReset: () => void;
  children: ReactNode;
}

/** Catches render errors without logging any answer data. */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // Intentionally no logging of state or answers (privacy).
    console.error('Rap Sheet Finder: a screen failed to render.');
  }
  render() {
    if (!this.state.failed) return this.props.children;
    const { locale } = this.props;
    return (
      <div className="card p-6" role="alert">
        <h2 className="mt-0 text-2xl">{ui('error', locale)}</h2>
        <p>{ui('errorBody', locale)}</p>
        <p>
          <a href="https://santaclara.courts.ca.gov/divisions/criminal-division/criminal-case-records" target="_blank" rel="noopener noreferrer">
            santaclara.courts.ca.gov
          </a>
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            this.setState({ failed: false });
            this.props.onReset();
          }}
        >
          {ui('startOver', locale)}
        </button>
      </div>
    );
  }
}
