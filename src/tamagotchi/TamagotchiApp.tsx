import { useEffect, useState } from 'react';
import { Creature } from './Creature';
import { StatBar } from './StatBar';
import { useTamagotchi } from './useTamagotchi';

function moodFromStats(hunger: number, fun: number, clean: number): 'happy' | 'neutral' | 'sad' {
  const avg = (hunger + fun + clean) / 3;
  if (avg > 66) return 'happy';
  if (avg > 33) return 'neutral';
  return 'sad';
}

const STAGE_LABEL: Record<string, string> = {
  baby: 'Baby',
  kind: 'Kind',
  erwachsen: 'Erwachsen',
};

export function TamagotchiApp() {
  const { state, hatch, feed, play, wash, toggleSleep, medicate, reset } = useTamagotchi();
  const [nameInput, setNameInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 1600);
    return () => clearTimeout(id);
  }, [message]);

  function act(action: () => void, text: string) {
    action();
    setMessage(text);
  }

  if (state.name === null) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col items-center justify-center gap-6 px-6 text-center">
        <span className="animate-float text-7xl">🥚</span>
        <div>
          <h1 className="text-xl font-bold text-brand-900 dark:text-stone-100">Ein Ei wartet darauf zu schlüpfen</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Gib deinem neuen Tamagotchi einen Namen, dann schlüpft es.
          </p>
        </div>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          maxLength={20}
          placeholder="Name eingeben"
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-center text-lg dark:border-brand-900 dark:bg-stone-900"
        />
        <button
          onClick={() => nameInput.trim() && hatch(nameInput.trim())}
          disabled={!nameInput.trim()}
          className="tap-shrink w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white shadow-sm shadow-brand-900/20 disabled:opacity-40"
        >
          Schlüpfen lassen 🐣
        </button>
      </div>
    );
  }

  const mood = moodFromStats(state.hunger, state.fun, state.clean);
  const dirty = state.clean < 40;
  const visibleStage = state.stage === 'ei' ? 'baby' : state.stage;
  const ageDays = Math.floor((Date.now() - state.birthTs) / 86_400_000) + 1;

  function handleReset() {
    if (window.confirm(`${state.name} wirklich vergessen und ganz neu anfangen?`)) {
      reset();
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col px-4 py-5">
      <header className="pt-safe flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-brand-900 dark:text-stone-100">{state.name}</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {STAGE_LABEL[state.stage] ?? 'Baby'} · Tag {ageDays}
          </p>
        </div>
        <button
          onClick={handleReset}
          aria-label="Neu starten"
          className="tap-shrink flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-sm dark:bg-stone-800"
        >
          ↺
        </button>
      </header>

      {state.sick && (
        <div className="mt-4 rounded-xl bg-red-100 px-4 py-2.5 text-center text-sm font-medium text-red-800 dark:bg-red-950 dark:text-red-300">
          😷 {state.name} ist krank – gib schnell Medizin!
        </div>
      )}

      <div className="relative flex flex-1 items-center justify-center py-4">
        <Creature stage={visibleStage} mood={mood} asleep={state.asleep} sick={state.sick} dirty={dirty} />
        {message && (
          <div className="animate-bubble-in absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1.5 text-sm font-medium whitespace-nowrap shadow-md dark:bg-stone-800">
            {message}
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        <StatBar icon="🍗" label="Hunger" value={state.hunger} colorClass="bg-sun-500" />
        <StatBar icon="🎮" label="Spaß" value={state.fun} colorClass="bg-pink-500" />
        <StatBar icon="🧼" label="Sauberkeit" value={state.clean} colorClass="bg-sky-500" />
        <StatBar icon="🔋" label="Energie" value={state.energy} colorClass="bg-violet-500" />
      </div>

      {state.asleep ? (
        <button
          onClick={() => act(toggleSleep, `${state.name} wacht auf!`)}
          className="tap-shrink mt-5 w-full rounded-xl bg-brand-600 px-4 py-3.5 font-semibold text-white shadow-sm shadow-brand-900/20"
        >
          ☀️ Aufwecken
        </button>
      ) : (
        <div className="mt-5 grid grid-cols-4 gap-2.5">
          <button
            onClick={() => act(feed, 'Lecker! 😋')}
            className="tap-shrink flex flex-col items-center gap-1 rounded-xl bg-white py-3 text-2xl shadow-sm dark:bg-stone-800"
          >
            🍎
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Füttern</span>
          </button>
          <button
            onClick={() => act(play, 'Das macht Spaß! 🥳')}
            className="tap-shrink flex flex-col items-center gap-1 rounded-xl bg-white py-3 text-2xl shadow-sm dark:bg-stone-800"
          >
            🎮
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Spielen</span>
          </button>
          <button
            onClick={() => act(wash, 'Sauber & sauber! ✨')}
            className="tap-shrink flex flex-col items-center gap-1 rounded-xl bg-white py-3 text-2xl shadow-sm dark:bg-stone-800"
          >
            🧼
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Waschen</span>
          </button>
          <button
            onClick={() => act(toggleSleep, 'Gute Nacht! 😴')}
            className="tap-shrink flex flex-col items-center gap-1 rounded-xl bg-white py-3 text-2xl shadow-sm dark:bg-stone-800"
          >
            😴
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Schlafen</span>
          </button>
        </div>
      )}

      {state.sick && !state.asleep && (
        <button
          onClick={() => act(medicate, 'Gesund! 💊')}
          className="tap-shrink mt-2.5 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white shadow-sm"
        >
          💊 Medizin geben
        </button>
      )}
    </div>
  );
}
