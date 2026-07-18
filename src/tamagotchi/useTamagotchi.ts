import { useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type Stage = 'ei' | 'baby' | 'kind' | 'erwachsen';

export interface TamagotchiState {
  name: string | null;
  birthTs: number;
  lastUpdateTs: number;
  hunger: number;
  fun: number;
  clean: number;
  energy: number;
  asleep: boolean;
  sick: boolean;
  stage: Stage;
}

const STORAGE_KEY = 'tamagotchi-save';
const TICK_MS = 30_000;
const MAX_OFFLINE_MS = 72 * 60 * 60 * 1000;

// Volle Balken laufen über diese Zeit (in Minuten) leer bzw. voll.
const MINUTES_TO_EMPTY = { hunger: 480, fun: 600, clean: 720, energyAwake: 600 };
const MINUTES_TO_FULL_ASLEEP = 240;

const SICK_DECAY_MULTIPLIER = 1.5;

const GROWTH = {
  kindAfterMs: 2 * 24 * 60 * 60 * 1000,
  erwachsenAfterMs: 5 * 24 * 60 * 60 * 1000,
};

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}

function stageForAge(ageMs: number): Stage {
  if (ageMs >= GROWTH.erwachsenAfterMs) return 'erwachsen';
  if (ageMs >= GROWTH.kindAfterMs) return 'kind';
  return 'baby';
}

function initialState(): TamagotchiState {
  const now = Date.now();
  return {
    name: null,
    birthTs: now,
    lastUpdateTs: now,
    hunger: 100,
    fun: 100,
    clean: 100,
    energy: 100,
    asleep: false,
    sick: false,
    stage: 'ei',
  };
}

function applyElapsedTime(state: TamagotchiState, elapsedMs: number): TamagotchiState {
  if (state.name === null || elapsedMs <= 0) {
    return { ...state, lastUpdateTs: Date.now() };
  }

  const minutes = Math.min(elapsedMs, MAX_OFFLINE_MS) / 60_000;
  const mult = state.sick ? SICK_DECAY_MULTIPLIER : 1;

  const hunger = clamp(state.hunger - (100 / MINUTES_TO_EMPTY.hunger) * minutes * mult);
  const fun = clamp(state.fun - (100 / MINUTES_TO_EMPTY.fun) * minutes * mult);
  const clean = clamp(state.clean - (100 / MINUTES_TO_EMPTY.clean) * minutes * mult);
  const energyDelta = state.asleep
    ? (100 / MINUTES_TO_FULL_ASLEEP) * minutes
    : -(100 / MINUTES_TO_EMPTY.energyAwake) * minutes;
  const energy = clamp(state.energy + energyDelta);

  const becameSick = state.sick || hunger === 0 || fun === 0 || clean === 0;
  const age = Date.now() - state.birthTs;

  return {
    ...state,
    hunger,
    fun,
    clean,
    energy,
    sick: becameSick,
    stage: stageForAge(age),
    lastUpdateTs: Date.now(),
  };
}

export function useTamagotchi() {
  const [state, setState] = useLocalStorage<TamagotchiState>(STORAGE_KEY, initialState());
  const didCatchUp = useRef(false);

  useEffect(() => {
    if (didCatchUp.current) return;
    didCatchUp.current = true;
    setState((prev) => applyElapsedTime(prev, Date.now() - prev.lastUpdateTs));
  }, [setState]);

  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => applyElapsedTime(prev, Date.now() - prev.lastUpdateTs));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [setState]);

  const hatch = useCallback(
    (name: string) => {
      const now = Date.now();
      setState((prev) => ({ ...prev, name, birthTs: now, lastUpdateTs: now, stage: 'baby' }));
    },
    [setState],
  );

  const feed = useCallback(() => {
    setState((prev) => ({ ...prev, hunger: clamp(prev.hunger + 25) }));
  }, [setState]);

  const play = useCallback(() => {
    setState((prev) => ({
      ...prev,
      fun: clamp(prev.fun + 25),
      energy: clamp(prev.energy - 10),
      hunger: clamp(prev.hunger - 8),
    }));
  }, [setState]);

  const wash = useCallback(() => {
    setState((prev) => ({ ...prev, clean: 100 }));
  }, [setState]);

  const toggleSleep = useCallback(() => {
    setState((prev) => ({ ...prev, asleep: !prev.asleep }));
  }, [setState]);

  const medicate = useCallback(() => {
    setState((prev) => (prev.sick ? { ...prev, sick: false } : prev));
  }, [setState]);

  const reset = useCallback(() => {
    setState(initialState());
  }, [setState]);

  return { state, hatch, feed, play, wash, toggleSleep, medicate, reset };
}
