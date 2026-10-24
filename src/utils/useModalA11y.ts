import { useEffect, useRef } from 'react';

/**
 * Hook to make modals WCAG accessible:
 * - Traps focus inside the dialog when open
 * - Closes on Escape key press
 * - Automatically moves focus to the first interactive element or dialog on open
 * - Restores focus to the previously active element upon closing
 */
export function useModalA11y(isOpen: boolean, onClose: () => void) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save current active element before modal steals focus
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    const modalNode = modalRef.current;
    if (!modalNode) return;

    // Focus the first focusable element inside the modal
    const getFocusableElements = (): HTMLElement[] => {
      if (!modalNode) return [];
      const focusableSelectors =
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(modalNode.querySelectorAll<HTMLElement>(focusableSelectors));
    };

    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      // Small timeout ensures DOM is ready and visible
      const timer = setTimeout(() => {
        focusable[0]?.focus();
      }, 30);
      return () => clearTimeout(timer);
    } else {
      modalNode.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const modalNode = modalRef.current;
        if (!modalNode) return;

        const focusableSelectors =
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusable = Array.from(modalNode.querySelectorAll<HTMLElement>(focusableSelectors));

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !modalNode.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !modalNode.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to previously active element
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  return modalRef;
}
