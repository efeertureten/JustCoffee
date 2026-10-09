import React, { useEffect, useReducer, useRef, useState } from 'react';
import {
  Bean,
  ChefHat,
  Coffee,
  Gauge,
  MousePointerClick,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Wallet,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Oyun verileri                                                      */
/* ------------------------------------------------------------------ */

const SAVE_KEY = 'barista-clicker-save-v1';
const COST_GROWTH = 1.15; // her alımda fiyat %15 artar

const UPGRADES = [
  {
    id: 'beans',
    name: 'Daha İyi Çekirdek',
    desc: 'Tek kökenli, taze kavrulmuş Arabica. Her tıklamada daha çok fincan.',
    effect: '+1 kahve / tık',
    baseCost: 15,
    icon: Bean,
  },
  {
    id: 'machine',
    name: 'Otomatik Espresso Makinesi',
    desc: '9 bar basınçla kendi kendine shot çeker. Sen dinlenirken üretir.',
    effect: '+1 kahve / sn',
    baseCost: 60,
    icon: Gauge,
  },
  {
    id: 'barista',
    name: 'Deneyimli Barista',
    desc: 'Latte art ustası. İki gruplu makineyi aynı anda yönetir.',
    effect: '+10 kahve / sn',
    baseCost: 500,
    icon: ChefHat,
  },
];

// Dükkan büyüdükçe fincan başına satış fiyatı artar (eşikler: toplam demlenen fincan)
const SHOPS = [
  { name: 'Seyyar Tezgâh', at: 0, price: 1 },
  { name: 'Köşe Kafe', at: 150, price: 1.25 },
  { name: 'Mahalle Kahvecisi', at: 1500, price: 1.5 },
  { name: 'Kavurma Atölyesi', at: 15000, price: 2 },
  { name: 'Kahve Zinciri', at: 150000, price: 3 },
  { name: 'Kahve İmparatorluğu', at: 2000000, price: 5 },
];

const INITIAL_STATE = {
  money: 0, // kasadaki para
  coffees: 0, // toplam demlenen fincan
  earned: 0, // toplam kazanılan para
  clicks: 0,
  owned: { beans: 0, machine: 0, barista: 0 },
};

/* ------------------------------------------------------------------ */
/*  Yardımcılar                                                        */
/* ------------------------------------------------------------------ */

const nfInt = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });
const nfOne = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });
const nfTwo = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nfCompact = new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 2 });

const fmt = (n) => (n < 1e6 ? nfInt.format(Math.floor(n)) : nfCompact.format(n));
const fmtRate = (n) => (n < 1e6 ? nfOne.format(n) : nfCompact.format(n));
const fmtMoney = (n) => `₺${fmt(n)}`;
const fmtPrice = (n) => `₺${nfTwo.format(n)}`;

const getShopIndex = (coffees) => {
  let index = 0;
  SHOPS.forEach((shop, i) => {
    if (coffees >= shop.at) index = i;
  });
  return index;
};
const perClickOf = (owned) => 1 + owned.beans;
const cpsOf = (owned) => owned.machine * 1 + owned.barista * 10;
const costOf = (upgrade, owned) => Math.ceil(upgrade.baseCost * Math.pow(COST_GROWTH, owned[upgrade.id]));

function produce(state, amount) {
  if (amount <= 0) return state;
  const income = amount * SHOPS[getShopIndex(state.coffees)].price;
  return {
    ...state,
    money: state.money + income,
    coffees: state.coffees + amount,
    earned: state.earned + income,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'click':
      return { ...produce(state, perClickOf(state.owned)), clicks: state.clicks + 1 };
    case 'tick':
      return produce(state, cpsOf(state.owned) * action.dt);
    case 'buy': {
      const upgrade = UPGRADES.find((u) => u.id === action.id);
      const cost = costOf(upgrade, state.owned);
      if (state.money < cost) return state;
      return {
        ...state,
        money: state.money - cost,
        owned: { ...state.owned, [upgrade.id]: state.owned[upgrade.id] + 1 },
      };
    }
    case 'reset':
      return INITIAL_STATE;
    default:
      return state;
  }
}

function loadSave(initialSave) {
  let src = initialSave;
  if (!src) {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      src = raw ? JSON.parse(raw) : null;
    } catch {
      src = null;
    }
  }
  if (!src || typeof src !== 'object') return INITIAL_STATE;
  const num = (v) => (Number.isFinite(v) && v >= 0 ? v : 0);
  return {
    money: num(src.money),
    coffees: num(src.coffees),
    earned: num(src.earned),
    clicks: Math.floor(num(src.clicks)),
    owned: {
      beans: Math.floor(num(src.owned?.beans)),
      machine: Math.floor(num(src.owned?.machine)),
      barista: Math.floor(num(src.owned?.barista)),
    },
  };
}

/* Renk ve yazı tipi tokenları, animasyonlar */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
.bc-root {
  --foam: #f1e6d6;
  --milk: #fbf6ee;
  --paper: #e9dac5;
  --line: #dcc8ad;
  --ink: #2b1a11;
  --roast: #6b4029;
  --muted: #86654f;
  --crema: #d0924a;
  --crema-deep: #9c5f1e;
  --crema-soft: rgba(208, 146, 74, 0.16);
  --espresso: #24150d;
  --espresso-2: #321f15;
  --espresso-3: #3d281c;
  --line-dark: #4b3123;
  --on-dark: #f5eadb;
  --on-dark-muted: #bba189;
  --font-display: 'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif;
  --font-body: 'Figtree', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  font-family: var(--font-body);
  color-scheme: light;
}
.bc-display { font-family: var(--font-display); letter-spacing: -0.01em; text-wrap: balance; }
.bc-mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
.bc-cup { -webkit-tap-highlight-color: transparent; }
.bc-bob { animation: bc-bob 3.2s ease-in-out infinite; }
.bc-ring { animation: bc-ring 0.55s ease-out forwards; }
.bc-float { animation: bc-float 0.9s ease-out forwards; transform: translate(-50%, -50%); }
.bc-toast { animation: bc-toast 0.35s ease-out both; }
@keyframes bc-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes bc-ring { from { transform: scale(1); opacity: 0.8; } to { transform: scale(1.2); opacity: 0; } }
@keyframes bc-float {
  0% { opacity: 0; transform: translate(-50%, -40%) scale(0.85); }
  15% { opacity: 1; transform: translate(-50%, -80%) scale(1.08); }
  100% { opacity: 0; transform: translate(-50%, -280%) scale(1); }
}
@keyframes bc-fade { 0%, 60% { opacity: 1; } 100% { opacity: 0; } }
@keyframes bc-toast { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) {
  .bc-bob, .bc-ring, .bc-toast { animation: none; }
  .bc-float { animation: bc-fade 0.9s ease-out forwards; }
}
`;

/* ------------------------------------------------------------------ */
/*  Bileşen                                                            */
/* ------------------------------------------------------------------ */

// Not: Kök eleman h-full kullanır; ebeveyni tam yükseklikte olmalı (ya da h-screen'e çevir).
export default function BaristaClicker({ initialSave, onSave } = {}) {
  const [state, dispatch] = useReducer(reducer, initialSave, loadSave);
  const [floaters, setFloaters] = useState([]);
  const [bump, setBump] = useState(0);
  const [toast, setToast] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const stateRef = useRef(state);
  const onSaveRef = useRef(onSave);
  const cupWrapRef = useRef(null);
  const floaterId = useRef(0);
  const timers = useRef(new Set());
  stateRef.current = state;
  onSaveRef.current = onSave;

  const shopIndex = getShopIndex(state.coffees);
  const shop = SHOPS[shopIndex];
  const nextShop = SHOPS[shopIndex + 1];
  const perClick = perClickOf(state.owned);
  const cps = cpsOf(state.owned);
  const shopProgress = nextShop
    ? Math.min(1, (state.coffees - shop.at) / (nextShop.at - shop.at))
    : 1;

  // Oyun döngüsü: geçen gerçek süreye göre üretim (arka planda kısılan sekmelerde de doğru çalışır)
  useEffect(() => {
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 3600);
      last = now;
      dispatch({ type: 'tick', dt });
    }, 100);
    return () => clearInterval(id);
  }, []);

  // Otomatik kayıt
  useEffect(() => {
    const save = () => {
      try {
        window.localStorage.setItem(SAVE_KEY, JSON.stringify(stateRef.current));
      } catch {
        /* depolama kapalıysa sessizce geç */
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') save();
    };
    const id = setInterval(save, 2000);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', save);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', save);
      save();
    };
  }, []);

  useEffect(() => {
    onSaveRef.current?.(state);
  }, [state]);

  // Dükkan büyüdüğünde bildirim
  const prevShop = useRef(shopIndex);
  useEffect(() => {
    const prev = prevShop.current;
    prevShop.current = shopIndex;
    if (shopIndex > prev) {
      setToast(SHOPS[shopIndex]);
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
    if (shopIndex < prev) setToast(null);
    return undefined;
  }, [shopIndex]);

  // Sıfırlama onayı 3 sn sonra kendiliğinden kapanır
  useEffect(() => {
    if (!confirmReset) return undefined;
    const t = setTimeout(() => setConfirmReset(false), 3000);
    return () => clearTimeout(t);
  }, [confirmReset]);

  // Bileşen kapanırken bekleyen zamanlayıcıları temizle
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const handleBrew = (event) => {
    dispatch({ type: 'click' });
    setBump((b) => b + 1);

    const rect = cupWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fromPointer = event.detail > 0 && event.clientX;
    const x = fromPointer ? event.clientX - rect.left : rect.width / 2;
    const y = fromPointer ? event.clientY - rect.top : rect.height * 0.35;
    const id = ++floaterId.current;
    const jitter = (Math.random() - 0.5) * 36;
    setFloaters((list) => [...list.slice(-14), { id, x: x + jitter, y, amount: perClick }]);
    const t = setTimeout(() => {
      setFloaters((list) => list.filter((f) => f.id !== id));
      timers.current.delete(t);
    }, 900);
    timers.current.add(t);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setConfirmReset(false);
    setFloaters([]);
    dispatch({ type: 'reset' });
  };

  return (
    <div
      lang="tr"
      className="bc-root flex min-h-full w-full flex-col bg-[var(--foam)] text-[var(--ink)] lg:grid lg:h-full lg:grid-cols-[minmax(0,1fr)_400px]"
    >
      <style>{STYLES}</style>

      {/* ---------------- Sol / orta: istatistikler + kahve bardağı ---------------- */}
      <main className="flex min-w-0 flex-col gap-6 px-4 py-5 sm:px-8 sm:py-6 lg:overflow-y-auto">
        <section
          aria-label="Dükkan durumu"
          className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--milk)] p-5 shadow-[0_18px_40px_-28px_rgba(43,26,17,0.55)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-[var(--foam)]">
                <Store size={19} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Dükkanın
                </p>
                <p className="bc-display truncate text-lg font-extrabold leading-tight">{shop.name}</p>
              </div>
            </div>
            <span className="bc-mono shrink-0 rounded-full border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--roast)]">
              Sv. {shopIndex + 1}/{SHOPS.length}
            </span>
          </div>

          <div className="mt-5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              <Wallet size={14} strokeWidth={2.2} /> Kasa
            </p>
            <p className="bc-mono mt-1 text-4xl font-semibold tracking-tight sm:text-[2.75rem]">
              {fmtMoney(state.money)}
            </p>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="min-w-0 rounded-2xl bg-[var(--paper)] p-3">
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                <TrendingUp size={14} strokeWidth={2.2} /> Saniyede üretim
              </dt>
              <dd className="mt-1 flex items-baseline gap-1.5">
                <span className="bc-mono text-xl font-semibold">{fmtRate(cps)}</span>
                <span className="text-xs font-medium text-[var(--roast)]">CPS</span>
              </dd>
              <dd className="mt-0.5 truncate text-xs text-[var(--muted)]">
                kahve/sn · ≈ ₺{fmtRate(cps * shop.price)}/sn
              </dd>
            </div>
            <div className="min-w-0 rounded-2xl bg-[var(--paper)] p-3">
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                <Sparkles size={14} strokeWidth={2.2} /> Toplam kazanç
              </dt>
              <dd className="bc-mono mt-1 truncate text-xl font-semibold">{fmtMoney(state.earned)}</dd>
              <dd className="mt-0.5 truncate text-xs text-[var(--muted)]">
                {fmt(state.coffees)} fincan demlendi
              </dd>
            </div>
          </dl>

          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="font-semibold text-[var(--roast)]">
                {nextShop ? `Sonraki dükkan: ${nextShop.name}` : 'En büyük dükkana ulaştın'}
              </span>
              {nextShop && (
                <span className="bc-mono shrink-0 text-[var(--muted)]">
                  {fmt(state.coffees)} / {fmt(nextShop.at)}
                </span>
              )}
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--paper)]"
              role="progressbar"
              aria-label="Sonraki dükkana ilerleme"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(shopProgress * 100)}
            >
              <div
                className="h-full rounded-full bg-[var(--crema)] transition-[width] duration-300"
                style={{ width: `${shopProgress * 100}%` }}
              />
            </div>
            {nextShop && (
              <p className="mt-2 text-xs text-[var(--muted)]">
                Büyüyünce fincan fiyatı {fmtPrice(shop.price)} → {fmtPrice(nextShop.price)}
              </p>
            )}
          </div>
        </section>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-4 lg:py-0">
          <div ref={cupWrapRef} className="relative">
            <button
              type="button"
              onClick={handleBrew}
              aria-label={`Kahve demle: tık başına ${perClick} kahve`}
              className="bc-cup relative grid h-64 w-64 select-none place-items-center rounded-full border-[12px] border-[var(--paper)] bg-[var(--milk)] shadow-[0_30px_60px_-30px_rgba(43,26,17,0.6),inset_0_-10px_0_rgba(43,26,17,0.04)] transition-transform duration-100 ease-out hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--crema)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--foam)] sm:h-72 sm:w-72 lg:[@media(max-height:820px)]:h-60 lg:[@media(max-height:820px)]:w-60"
            >
              {bump > 0 && (
                <span
                  key={bump}
                  aria-hidden="true"
                  className="bc-ring pointer-events-none absolute -inset-3 rounded-full border-2 border-[var(--crema)]"
                />
              )}
              <span aria-hidden="true" className="absolute inset-6 rounded-full border border-dashed border-[var(--line)]" />
              <Coffee aria-hidden="true" className="bc-bob h-32 w-32 text-[var(--ink)] sm:h-36 sm:w-36" strokeWidth={1.35} />
            </button>

            {floaters.map((f) => (
              <span
                key={f.id}
                aria-hidden="true"
                className="bc-float bc-mono pointer-events-none absolute whitespace-nowrap text-xl font-semibold text-[var(--crema-deep)]"
                style={{ left: f.x, top: f.y }}
              >
                +{fmt(f.amount)}
              </span>
            ))}
          </div>

          <div className="text-center">
            <p className="bc-display text-2xl font-extrabold sm:text-3xl">Demle, sat, büyü.</p>
            <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-[var(--roast)]">
              <MousePointerClick size={16} strokeWidth={2} aria-hidden="true" />
              <span>
                Tık başına <strong className="bc-mono font-semibold text-[var(--ink)]">+{fmt(perClick)}</strong> kahve
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Fincanı <strong className="bc-mono font-semibold text-[var(--ink)]">{fmtPrice(shop.price)}</strong>
              </span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--muted)] lg:text-left">
          {fmt(state.clicks)} tık · İlerlemen bu tarayıcıda otomatik kaydedilir.
        </p>
      </main>

      {/* ---------------- Sağ: Market ---------------- */}
      <aside aria-label="Market" className="bg-[var(--espresso)] text-[var(--on-dark)] lg:h-full lg:overflow-y-auto">
        <div className="flex flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
          <header className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--on-dark-muted)]">
                Yükseltmeler
              </p>
              <h2 className="bc-display mt-1 flex items-center gap-2 text-2xl font-extrabold">
                <ShoppingBag size={22} strokeWidth={2} aria-hidden="true" /> Market
              </h2>
            </div>
            <p className="bc-mono rounded-full bg-[var(--espresso-2)] px-3 py-1.5 text-sm font-semibold text-[var(--crema)]">
              {fmtMoney(state.money)}
            </p>
          </header>

          <div className="flex flex-col gap-3">
            {UPGRADES.map((upgrade) => {
              const Icon = upgrade.icon;
              const owned = state.owned[upgrade.id];
              const cost = costOf(upgrade, state.owned);
              const affordable = state.money >= cost;
              const progress = Math.min(1, state.money / cost);

              return (
                <button
                  key={upgrade.id}
                  type="button"
                  disabled={!affordable}
                  onClick={() => dispatch({ type: 'buy', id: upgrade.id })}
                  aria-label={`${upgrade.name} satın al, ${fmtMoney(cost)}. Sahip olunan: ${owned}`}
                  className="relative w-full overflow-hidden rounded-2xl border border-[var(--line-dark)] bg-[var(--espresso-2)] p-4 text-left transition duration-150 enabled:hover:border-[var(--crema)] enabled:hover:bg-[var(--espresso-3)] enabled:active:scale-[0.985] disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crema)]"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-colors ${
                        affordable
                          ? 'bg-[var(--crema)] text-[var(--espresso)]'
                          : 'bg-[var(--line-dark)] text-[var(--on-dark-muted)]'
                      }`}
                    >
                      <Icon size={24} strokeWidth={2} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="bc-display text-base font-semibold leading-tight">{upgrade.name}</h3>
                        <span className="bc-mono shrink-0 text-xs text-[var(--on-dark-muted)]">{owned} adet</span>
                      </div>
                      <p className="mt-1 text-[13px] leading-snug text-[var(--on-dark-muted)]">{upgrade.desc}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-[var(--crema-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--crema)]">
                          {upgrade.effect}
                        </span>
                        <span
                          className={`bc-mono text-base font-semibold ${
                            affordable ? 'text-[var(--crema)]' : 'text-[var(--on-dark-muted)]'
                          }`}
                        >
                          {fmtMoney(cost)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!affordable && (
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-[var(--line-dark)]">
                      <span
                        className="block h-full bg-[var(--crema)] opacity-70 transition-[width] duration-300"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line-dark)] pt-4">
            <p className="text-xs text-[var(--on-dark-muted)]">Her alımda fiyat %15 artar.</p>
            <button
              type="button"
              onClick={handleReset}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--crema)] ${
                confirmReset
                  ? 'border-[var(--crema)] bg-[var(--crema)] text-[var(--espresso)]'
                  : 'border-[var(--line-dark)] text-[var(--on-dark-muted)] hover:border-[var(--on-dark-muted)] hover:text-[var(--on-dark)]'
              }`}
            >
              <RotateCcw size={14} strokeWidth={2.2} aria-hidden="true" />
              {confirmReset ? 'Emin misin? Tekrar bas' : 'Oyunu sıfırla'}
            </button>
          </div>
        </div>
      </aside>

      {/* ---------------- Dükkan büyüdü bildirimi ---------------- */}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top,0px)+1rem)] z-50 flex justify-center px-4">
          <div
            role="status"
            className="bc-toast flex items-center gap-3 rounded-2xl bg-[var(--ink)] px-4 py-3 text-[var(--on-dark)] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--crema)] text-[var(--espresso)]">
              <Store size={18} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <div>
              <p className="bc-display text-sm font-extrabold">Dükkan büyüdü: {toast.name}</p>
              <p className="text-xs text-[var(--on-dark-muted)]">Fincan fiyatı artık {fmtPrice(toast.price)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
