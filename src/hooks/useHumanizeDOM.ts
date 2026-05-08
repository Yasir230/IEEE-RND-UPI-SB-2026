import { useEffect } from 'react';
import { humanizerID } from '../lib/humanizer-id';

/**
 * Walks all text nodes in the document body and applies humanizerID
 * to humanize all visible text programmatically, while preserving
 * proper nouns, input values, and code elements.
 */
export default function useHumanizeDOM(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    // Wait for React hydration + fonts
    const timer = setTimeout(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            // Skip script/style/code/pre and inputs
            const tag = parent.tagName.toLowerCase();
            if (['script', 'style', 'code', 'pre', 'textarea', 'input'].includes(tag)) {
              return NodeFilter.FILTER_REJECT;
            }
            // Skip elements with data-no-humanize
            if (parent.closest('[data-no-humanize]')) {
              return NodeFilter.FILTER_REJECT;
            }
            const text = node.textContent || '';
            if (!text.trim() || /^\s*$/.test(text)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      const nodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        nodes.push(node as Text);
      }

      nodes.forEach((textNode) => {
        const original = textNode.textContent || '';
        const humanized = humanizerID(original);
        if (humanized !== original) {
          textNode.textContent = humanized;
        }
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [enabled]);
}
