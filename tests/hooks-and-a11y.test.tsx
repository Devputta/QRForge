// @vitest-environment happy-dom
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, beforeEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useModalA11y } from '../src/utils/useModalA11y';
import { getInitialTheme, useTheme } from '../src/utils/theme';

function TestModalHarness({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const modalRef = useModalA11y(isOpen, onClose);
  if (!isOpen) return null;
  return (
    <div ref={modalRef} role="dialog" aria-modal="true" tabIndex={-1}>
      <button id="modal-first-btn" type="button">
        First Action
      </button>
      <button id="modal-second-btn" type="button">
        Second Action
      </button>
    </div>
  );
}

function TestThemeHarness() {
  const { theme, cycleTheme, setTheme } = useTheme();
  return (
    <div>
      <span id="theme-value">{theme}</span>
      <button id="cycle-theme" type="button" onClick={cycleTheme}>
        Cycle
      </button>
      <button id="force-dark" type="button" onClick={() => setTheme('dark')}>
        Dark
      </button>
      <button id="force-light" type="button" onClick={() => setTheme('light')}>
        Light
      </button>
    </div>
  );
}

describe('Accessibility & Theme Hooks Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('traps Tab / Shift+Tab focus inside open modal, closes on Escape, and restores trigger focus', async () => {
    const container = document.createElement('div');
    const triggerBtn = document.createElement('button');
    triggerBtn.id = 'outside-trigger';
    triggerBtn.textContent = 'Open Modal';
    document.body.appendChild(triggerBtn);
    document.body.appendChild(container);

    triggerBtn.focus();
    expect(document.activeElement).toBe(triggerBtn);

    const root = createRoot(container);
    let closedCount = 0;

    await act(async () => {
      root.render(
        <TestModalHarness
          isOpen={true}
          onClose={() => {
            closedCount += 1;
          }}
        />
      );
    });

    const firstBtn = container.querySelector('#modal-first-btn') as HTMLButtonElement;
    const secondBtn = container.querySelector('#modal-second-btn') as HTMLButtonElement;
    expect(firstBtn).not.toBeNull();
    expect(secondBtn).not.toBeNull();

    // Focus last button and press Tab -> should wrap to first button
    secondBtn.focus();
    const tabForward = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.dispatchEvent(tabForward);
    expect(document.activeElement).toBe(firstBtn);

    // Focus first button and press Shift+Tab -> should wrap to last button
    firstBtn.focus();
    const tabBackward = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tabBackward);
    expect(document.activeElement).toBe(secondBtn);

    // Press Escape -> calls onClose
    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.dispatchEvent(escEvent);
    expect(closedCount).toBe(1);

    // Close modal -> restores focus to outside trigger button
    await act(async () => {
      root.render(<TestModalHarness isOpen={false} onClose={() => {}} />);
    });
    expect(document.activeElement).toBe(triggerBtn);

    await act(async () => {
      root.unmount();
    });
    container.remove();
    triggerBtn.remove();
  });

  it('reads initial theme from localStorage and cycles system -> light -> dark -> system', async () => {
    expect(getInitialTheme()).toBe('system');
    localStorage.setItem('qrforge_theme', 'dark');
    expect(getInitialTheme()).toBe('dark');

    localStorage.clear();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TestThemeHarness />);
    });

    const valEl = container.querySelector('#theme-value') as HTMLElement;
    const cycleBtn = container.querySelector('#cycle-theme') as HTMLButtonElement;

    expect(valEl.textContent).toBe('system');

    // system -> light
    await act(async () => {
      cycleBtn.click();
    });
    expect(valEl.textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('qrforge_theme')).toBe('light');

    // light -> dark
    await act(async () => {
      cycleBtn.click();
    });
    expect(valEl.textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('qrforge_theme')).toBe('dark');

    // dark -> system
    await act(async () => {
      cycleBtn.click();
    });
    expect(valEl.textContent).toBe('system');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
