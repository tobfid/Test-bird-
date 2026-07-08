import { useState } from 'react';
import { BirdDetail } from './components/BirdDetail';
import { IdentifyWizard } from './components/IdentifyWizard';
import { Learn } from './components/Learn';
import { Overview } from './components/Overview';
import { ShareSheet } from './components/ShareSheet';
import { useLocalStorage } from './hooks/useLocalStorage';

type Tab = 'uebersicht' | 'lernen' | 'bestimmen' | 'favoriten';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'lernen', label: 'Lernen', icon: '🎓' },
  { id: 'uebersicht', label: 'Entdecken', icon: '📖' },
  { id: 'bestimmen', label: 'Bestimmen', icon: '🔍' },
  { id: 'favoriten', label: 'Favoriten', icon: '❤️' },
];

const TAB_TITLES: Record<Tab, { title: string; subtitle: string }> = {
  lernen: { title: 'Vögel lernen', subtitle: 'Einprägen, dann testen – häufigste Arten zuerst' },
  uebersicht: { title: 'Vögel entdecken', subtitle: '62 heimische Arten zum Durchstöbern' },
  bestimmen: { title: 'Vogel bestimmen', subtitle: 'Schritt für Schritt zur richtigen Art' },
  favoriten: { title: 'Deine Favoriten', subtitle: 'Gemerkte Arten auf einen Blick' },
};

function App() {
  const [tab, setTab] = useState<Tab>('lernen');
  const [favorites, setFavorites] = useLocalStorage<string[]>('vogelapp-favoriten', []);
  const [selectedBird, setSelectedBird] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  function toggleFavorite(id: string) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }

  const { title, subtitle } = TAB_TITLES[tab];

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col">
      <header className="pt-safe sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-brand-100 bg-cream-50/90 px-4 py-3 backdrop-blur-sm dark:border-brand-950 dark:bg-cream-950/90">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🐦</span>
          <div>
            <h1 className="text-base leading-tight font-bold text-brand-900 dark:text-brand-200">{title}</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setShareOpen(true)}
          aria-label="App teilen"
          className="tap-shrink flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg text-white shadow-sm shadow-brand-900/20"
        >
          📲
        </button>
      </header>

      <main className="flex-1 px-4 py-5 pb-28">
        {tab === 'lernen' && <Learn favorites={favorites} onToggleFavorite={toggleFavorite} />}
        {tab === 'uebersicht' && (
          <Overview favorites={favorites} onToggleFavorite={toggleFavorite} onSelectBird={setSelectedBird} />
        )}
        {tab === 'bestimmen' && (
          <IdentifyWizard favorites={favorites} onToggleFavorite={toggleFavorite} onSelectBird={setSelectedBird} />
        )}
        {tab === 'favoriten' && (
          <Overview
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectBird={setSelectedBird}
            onlyFavorites
          />
        )}

        <p className="mt-10 text-center text-xs text-stone-400 dark:text-stone-600">
          Bilder & weiterführende Infos von Wikipedia, Gesang von xeno-canto.org. Kein Ersatz für professionelle
          Artbestimmung.
        </p>
      </main>

      <nav className="pb-safe sticky bottom-0 z-20 border-t border-brand-100 bg-cream-50/95 backdrop-blur-sm dark:border-brand-950 dark:bg-cream-950/95">
        <div className="mx-auto flex max-w-5xl">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="tap-shrink flex flex-1 flex-col items-center gap-0.5 py-2.5"
              >
                <span
                  className={`flex h-8 w-11 items-center justify-center rounded-full text-lg transition-colors ${
                    active ? 'bg-brand-100 dark:bg-brand-900' : ''
                  }`}
                >
                  {t.icon}
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    active ? 'text-brand-800 dark:text-brand-300' : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {selectedBird && (
        <BirdDetail
          birdId={selectedBird}
          isFavorite={favorites.includes(selectedBird)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedBird(null)}
          onSelectBird={setSelectedBird}
        />
      )}

      {shareOpen && <ShareSheet onClose={() => setShareOpen(false)} />}
    </div>
  );
}

export default App;
