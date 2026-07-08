import { useEffect, useRef, useState } from 'react';

/**
 * Liefert ein Ref und ob das Element (fast) im sichtbaren Bereich ist.
 * Dient dazu, teure Netzwerk-Ladevorgänge (z.B. Bilder) erst auszulösen,
 * wenn eine Karte tatsächlich in die Nähe des Viewports scrollt, statt
 * alle auf einmal beim ersten Rendern der Seite zu starten.
 */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView]);

  return [ref, inView] as const;
}
