import { useEffect, useState } from 'react';
import { Creature, EggSprite } from './Creature';
import { StatBar } from './StatBar';
import { useTamagotchi } from './useTamagotchi';

function moodFromStats(hunger: number, fun: number, clean: number): 'happy' | 'neutral' | 'sad' {
  const avg = (hunger + fun + clean) / 3;
  if (avg > 66) return 'happy';
  if (avg > 33) return 'neutral';
  return 'sad';
}

const STAGE_LABEL: Record<string, string> = {
  baby: 'BABY',
  kind: 'KIND',
  erwachsen: 'ERWACHSEN',
};

const SHELL_BG = 'linear-gradient(160deg, #cdbdf0, #9683d1)';
const PAGE_BG = 'radial-gradient(circle at 50% 20%, #ece4fb, #b9a3e0)';

function ActionButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn-3d flex flex-col items-center gap-1 rounded-xl bg-cream-50 py-2.5">
      <span className="text-lg">{icon}</span>
      <span className="font-pixel text-center text-[6.5px] leading-tight text-stone-700">{label}</span>
    </button>
  );
}

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
      <div className="flex min-h-svh w-full items-center justify-center px-4 py-8" style={{ background: PAGE_BG }}>
        <div className="shell-gloss w-full max-w-xs rounded-[2.5rem] p-5 pb-7" style={{ background: SHELL_BG }}>
          <div className="mx-auto mb-4 h-3 w-14 rounded-full bg-black/15" />

          <div className="lcd-screen flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-xl px-4 py-6 text-center">
            <EggSprite />
            <p className="font-pixel text-[10px] leading-relaxed" style={{ color: 'var(--lcd-fg)' }}>
              EIN EI
              <br />
              WARTET…
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={20}
              placeholder="Name eingeben"
              className="font-pixel w-full rounded-lg border-2 border-black/20 bg-white px-3 py-3 text-center text-xs text-stone-800"
            />
            <button
              onClick={() => nameInput.trim() && hatch(nameInput.trim())}
              disabled={!nameInput.trim()}
              className="btn-3d font-pixel w-full rounded-lg bg-cream-50 px-4 py-3 text-[11px] text-stone-800 disabled:opacity-40"
            >
              SCHLÜPFEN 🐣
            </button>
          </div>
        </div>
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
    <div className="flex min-h-svh w-full items-center justify-center px-4 py-8" style={{ background: PAGE_BG }}>
      <div className="shell-gloss w-full max-w-xs rounded-[2.5rem] p-5 pb-7" style={{ background: SHELL_BG }}>
        <div className="mx-auto mb-4 h-3 w-14 rounded-full bg-black/15" />

        <div className="flex items-center justify-between px-1 pb-2">
          <div className="font-pixel text-[8px] text-white/90">
            {state.name} · {STAGE_LABEL[state.stage] ?? 'BABY'} · TAG {ageDays}
          </div>
          <button
            onClick={handleReset}
            aria-label="Neu starten"
            className="btn-3d flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/80 text-[10px] text-stone-700"
          >
            ↺
          </button>
        </div>

        <div className="lcd-screen relative flex min-h-[210px] flex-col items-center justify-center gap-3 rounded-xl px-3 py-4">
          {state.sick && (
            <div
              className="animate-blink font-pixel rounded px-2 py-1.5 text-center text-[8px]"
              style={{ backgroundColor: 'var(--lcd-fg)', color: 'var(--lcd-bg)' }}
            >
              KRANK! MEDIZIN GEBEN
            </div>
          )}

          <Creature stage={visibleStage} mood={mood} asleep={state.asleep} sick={state.sick} dirty={dirty} />

          {message && (
            <div
              className="animate-bubble-in font-pixel absolute bottom-2 rounded border-2 px-2 py-1 text-center text-[7px] whitespace-nowrap"
              style={{ borderColor: 'var(--lcd-fg)', color: 'var(--lcd-fg)', backgroundColor: 'var(--lcd-bg)' }}
            >
              {message}
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1.5 rounded-lg bg-black/10 px-2.5 py-2.5">
          <StatBar icon="🍗" label="Hunger" value={state.hunger} />
          <StatBar icon="🎮" label="Spaß" value={state.fun} />
          <StatBar icon="🧼" label="Sauber" value={state.clean} />
          <StatBar icon="🔋" label="Energie" value={state.energy} />
        </div>

        {state.asleep ? (
          <button
            onClick={() => act(toggleSleep, `${state.name} WACHT AUF!`)}
            className="btn-3d font-pixel mt-4 w-full rounded-lg bg-cream-50 px-4 py-3 text-[10px] text-stone-800"
          >
            ☀️ AUFWECKEN
          </button>
        ) : (
          <div className="mt-4 grid grid-cols-4 gap-2">
            <ActionButton icon="🍎" label="FÜTTERN" onClick={() => act(feed, 'LECKER! 😋')} />
            <ActionButton icon="🎮" label="SPIELEN" onClick={() => act(play, 'JUHU! 🥳')} />
            <ActionButton icon="🧼" label="WASCHEN" onClick={() => act(wash, 'SAUBER! ✨')} />
            <ActionButton icon="😴" label="SCHLAFEN" onClick={() => act(toggleSleep, 'GUTE NACHT!')} />
          </div>
        )}

        {state.sick && !state.asleep && (
          <button
            onClick={() => act(medicate, 'GESUND! 💊')}
            className="btn-3d font-pixel mt-2.5 w-full rounded-lg px-4 py-2.5 text-[10px] text-white"
            style={{ backgroundColor: '#7a3b3b' }}
          >
            💊 MEDIZIN GEBEN
          </button>
        )}
      </div>
    </div>
  );
}
