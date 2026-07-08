import { useState } from 'react';
import { BirdDetail } from './components/BirdDetail';
import { IdentifyWizard } from './components/IdentifyWizard';
import { Overview } from './components/Overview';
import { Quiz } from './components/Quiz';
import { useLocalStorage } from './hooks/useLocalStorage';

type Tab = 'uebersicht' | 'bestimmen' | 'quiz' | 'favoriten';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'uebersicht', label: 'Übersicht', icon: '📖' },
  { id: 'bestimmen', label: 'Bestimmen', icon: '🔍' },
  { id: 'quiz', label: 'Quiz', icon: '🎯' },
  { id: 'favoriten', label: 'Favoriten', icon: '❤️' },
];

function App() {
  const [tab, setTab] = useState<Tab>('uebersicht');
  const [favorites, setFavorites] = useLocalStorage<string[]>('vogelapp-favoriten', []);
  const [selectedBird, setSelectedBird] = useState<string | null>(null);

  function toggleFavorite(id: string) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col">
      <header className="border-b border-stone-200 px-4 py-4 dark:border-stone-800">
        <h1 className="text-2xl font-bold text-green-800 dark:text-green-400">🐦 Vogelbestimmung Deutschland</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Heimische Vögel entdecken, bestimmen und spielerisch lernen
        </p>
      </header>

      <nav className="sticky top-0 z-10 flex border-b border-stone-200 bg-stone-50/95 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 border-b-2 px-2 py-3 text-sm font-medium transition ${
              tab === t.id
                ? 'border-green-700 text-green-700 dark:text-green-400'
                : 'border-transparent text-stone-500 dark:text-stone-400'
            }`}
          >
            <span className="mr-1">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 px-4 py-6">
        {tab === 'uebersicht' && (
          <Overview favorites={favorites} onToggleFavorite={toggleFavorite} onSelectBird={setSelectedBird} />
        )}
        {tab === 'bestimmen' && (
          <IdentifyWizard favorites={favorites} onToggleFavorite={toggleFavorite} onSelectBird={setSelectedBird} />
        )}
        {tab === 'quiz' && <Quiz />}
        {tab === 'favoriten' && (
          <Overview
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectBird={setSelectedBird}
            onlyFavorites
          />
        )}
      </main>

      <footer className="border-t border-stone-200 px-4 py-4 text-center text-xs text-stone-400 dark:border-stone-800">
        Bilder & weiterführende Infos von Wikipedia. Kein Ersatz für professionelle Artbestimmung.
      </footer>

      {selectedBird && (
        <BirdDetail
          birdId={selectedBird}
          isFavorite={favorites.includes(selectedBird)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedBird(null)}
          onSelectBird={setSelectedBird}
        />
      )}
    </div>
  );
}

export default App;
