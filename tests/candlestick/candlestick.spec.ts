import * as debut from '../../src/candlestick';
import { Candles } from '../../src/candlestick/candles';
import * as lwc from 'lightweight-charts-indicators';
import { genBars } from '../lwc-fixtures';

/**
 * Cross-SDK regression for candlestick patterns.
 *
 * Each LWC `calculate*` returns a `markers` array — one entry per bar
 * where the pattern fired. We collect the same set from the streaming
 * debut port and compare them by bar time. Synthetic OHLCV bars rarely
 * trigger every pattern, so we don't assert that every pattern fires
 * at least once — only that *whenever* it fires, the two
 * implementations agree on the bar.
 */

type Pair = {
    name: string;
    lwc: { calculate: (bars: any[]) => { markers: { time: number }[] } };
    debut: new (shared?: Candles) => debut.CandlestickPattern;
};

// LWC exports each pattern as a `{ calculate, metadata, ... }` object
// (no `calculate*` re-export for candlesticks), so we pull `calculate`
// off the pattern itself.
const pairs: Pair[] = [
    { name: 'Doji', lwc: (lwc as any).Doji, debut: debut.Doji },
    { name: 'DragonflyDoji', lwc: (lwc as any).DragonflyDoji, debut: debut.DragonflyDoji },
    { name: 'GravestoneDoji', lwc: (lwc as any).GravestoneDoji, debut: debut.GravestoneDoji },
    { name: 'Hammer', lwc: (lwc as any).Hammer, debut: debut.Hammer },
    { name: 'HangingMan', lwc: (lwc as any).HangingMan, debut: debut.HangingMan },
    { name: 'InvertedHammer', lwc: (lwc as any).InvertedHammer, debut: debut.InvertedHammer },
    { name: 'ShootingStar', lwc: (lwc as any).ShootingStar, debut: debut.ShootingStar },
    { name: 'LongLowerShadow', lwc: (lwc as any).LongLowerShadow, debut: debut.LongLowerShadow },
    { name: 'LongUpperShadow', lwc: (lwc as any).LongUpperShadow, debut: debut.LongUpperShadow },
    { name: 'MarubozuBlack', lwc: (lwc as any).MarubozuBlack, debut: debut.MarubozuBlack },
    { name: 'MarubozuWhite', lwc: (lwc as any).MarubozuWhite, debut: debut.MarubozuWhite },
    { name: 'SpinningTopBlack', lwc: (lwc as any).SpinningTopBlack, debut: debut.SpinningTopBlack },
    { name: 'SpinningTopWhite', lwc: (lwc as any).SpinningTopWhite, debut: debut.SpinningTopWhite },
    { name: 'DarkCloudCover', lwc: (lwc as any).DarkCloudCover, debut: debut.DarkCloudCover },
    { name: 'DojiStarBearish', lwc: (lwc as any).DojiStarBearish, debut: debut.DojiStarBearish },
    { name: 'DojiStarBullish', lwc: (lwc as any).DojiStarBullish, debut: debut.DojiStarBullish },
    { name: 'EngulfingBearish', lwc: (lwc as any).EngulfingBearish, debut: debut.EngulfingBearish },
    { name: 'EngulfingBullish', lwc: (lwc as any).EngulfingBullish, debut: debut.EngulfingBullish },
    { name: 'FallingWindow', lwc: (lwc as any).FallingWindow, debut: debut.FallingWindow },
    { name: 'RisingWindow', lwc: (lwc as any).RisingWindow, debut: debut.RisingWindow },
    { name: 'HaramiBearish', lwc: (lwc as any).HaramiBearish, debut: debut.HaramiBearish },
    { name: 'HaramiBullish', lwc: (lwc as any).HaramiBullish, debut: debut.HaramiBullish },
    { name: 'HaramiCrossBearish', lwc: (lwc as any).HaramiCrossBearish, debut: debut.HaramiCrossBearish },
    { name: 'HaramiCrossBullish', lwc: (lwc as any).HaramiCrossBullish, debut: debut.HaramiCrossBullish },
    { name: 'KickingBearish', lwc: (lwc as any).KickingBearish, debut: debut.KickingBearish },
    { name: 'KickingBullish', lwc: (lwc as any).KickingBullish, debut: debut.KickingBullish },
    { name: 'OnNeck', lwc: (lwc as any).OnNeck, debut: debut.OnNeck },
    { name: 'Piercing', lwc: (lwc as any).Piercing, debut: debut.Piercing },
    { name: 'TweezerBottom', lwc: (lwc as any).TweezerBottom, debut: debut.TweezerBottom },
    { name: 'TweezerTop', lwc: (lwc as any).TweezerTop, debut: debut.TweezerTop },
    { name: 'AbandonedBabyBearish', lwc: (lwc as any).AbandonedBabyBearish, debut: debut.AbandonedBabyBearish },
    { name: 'AbandonedBabyBullish', lwc: (lwc as any).AbandonedBabyBullish, debut: debut.AbandonedBabyBullish },
    { name: 'DownsideTasukiGap', lwc: (lwc as any).DownsideTasukiGap, debut: debut.DownsideTasukiGap },
    { name: 'UpsideTasukiGap', lwc: (lwc as any).UpsideTasukiGap, debut: debut.UpsideTasukiGap },
    { name: 'EveningStar', lwc: (lwc as any).EveningStar, debut: debut.EveningStar },
    { name: 'EveningDojiStar', lwc: (lwc as any).EveningDojiStar, debut: debut.EveningDojiStar },
    { name: 'MorningStar', lwc: (lwc as any).MorningStar, debut: debut.MorningStar },
    { name: 'MorningDojiStar', lwc: (lwc as any).MorningDojiStar, debut: debut.MorningDojiStar },
    { name: 'ThreeBlackCrows', lwc: (lwc as any).ThreeBlackCrows, debut: debut.ThreeBlackCrows },
    { name: 'ThreeWhiteSoldiers', lwc: (lwc as any).ThreeWhiteSoldiers, debut: debut.ThreeWhiteSoldiers },
    { name: 'TriStarBearish', lwc: (lwc as any).TriStarBearish, debut: debut.TriStarBearish },
    { name: 'TriStarBullish', lwc: (lwc as any).TriStarBullish, debut: debut.TriStarBullish },
    { name: 'FallingThreeMethods', lwc: (lwc as any).FallingThreeMethods, debut: debut.FallingThreeMethods },
    { name: 'RisingThreeMethods', lwc: (lwc as any).RisingThreeMethods, debut: debut.RisingThreeMethods },
];

describe('Candlestick patterns cross-SDK', () => {
    const bars = genBars(600, 101);

    it.each(pairs)('$name fires on the same bars as LWC', ({ lwc: lwcPattern, debut: PatternCtor }) => {
        const lwcResult = lwcPattern.calculate(bars);
        const lwcTimes: number[] = lwcResult.markers.map((m) => m.time).sort((a, b) => a - b);

        const detector = new PatternCtor();
        const debutTimes: number[] = [];
        for (const b of bars) {
            const fired = detector.nextValue(b.open, b.high, b.low, b.close);
            if (fired === true) debutTimes.push(b.time);
        }

        expect(debutTimes).toEqual(lwcTimes);
    });

    it('shared Candles produces identical output to per-pattern Candles', () => {
        const candles = new Candles();
        const sharedDoji = new debut.Doji(candles);
        const ownedDoji = new debut.Doji();
        const sharedFires: number[] = [];
        const ownedFires: number[] = [];

        for (const b of bars) {
            candles.nextValue(b.open, b.high, b.low, b.close);
            if (sharedDoji.detect() === true) sharedFires.push(b.time);
            if (ownedDoji.nextValue(b.open, b.high, b.low, b.close) === true) ownedFires.push(b.time);
        }

        expect(sharedFires).toEqual(ownedFires);
    });

    it('exposes Candles + every pattern via the `Candlestick` namespace export', () => {
        // Sanity-check the public namespace import. Using `require`
        // here keeps the test working under ts-jest's CJS transform
        // without depending on `esModuleInterop`.
        const root = require('../../index');
        expect(root.Candlestick.Candles).toBe(debut.Candles);
        expect(root.Candlestick.Doji).toBe(debut.Doji);
        expect(root.Candlestick.RisingThreeMethods).toBe(debut.RisingThreeMethods);
        // Individual exports must still work for backward compatibility.
        expect(root.Doji).toBe(debut.Doji);
        expect(root.Candles).toBe(debut.Candles);
    });

    describe('isolation: standalone patterns build minimal contexts', () => {
        // The whole point of declaring per-pattern requirements is that
        // standalone instances skip the heavy bits they don't read.
        // We poke at the package-private `candles` field via casts —
        // intentional, since the alternative is plumbing public getters
        // we don't otherwise want to expose.

        it('Doji owns a context without bodyAvg or trend', () => {
            const d = new debut.Doji() as any;
            expect(d.candles.tracksBodyAvg).toBe(false);
            expect(d.candles.tracksTrend).toBe(false);
            expect(d.candles.lookback).toBe(1);
        });

        it('MarubozuBlack owns a context with bodyAvg but no trend', () => {
            const m = new debut.MarubozuBlack() as any;
            expect(m.candles.tracksBodyAvg).toBe(true);
            expect(m.candles.tracksTrend).toBe(false);
            expect(m.candles.lookback).toBe(1);
        });

        it('Hammer owns a full-feature context (bodyAvg + trend)', () => {
            const h = new debut.Hammer() as any;
            expect(h.candles.tracksBodyAvg).toBe(true);
            expect(h.candles.tracksTrend).toBe(true);
            expect(h.candles.lookback).toBe(1);
        });

        it('FallingThreeMethods owns a 5-bar lookback context', () => {
            const f = new debut.FallingThreeMethods() as any;
            expect(f.candles.lookback).toBe(5);
        });

        it('Doji emits `false`/`true` from bar 1 — no SMA-50 warmup penalty', () => {
            // If Doji were paying for the trend filter, it'd return
            // `false` for the first 50 bars regardless of doji-shape
            // because `downTrend`/`upTrend` would be `false`. The
            // standalone Doji has no trend filter at all, so it can
            // legitimately fire from bar 1 onwards if the shape
            // matches.
            const detector = new debut.Doji();
            const seen = new Set<boolean | undefined>();
            // Hand-craft a Doji shape on bar 1.
            seen.add(detector.nextValue(100, 105, 95, 100)); // body=0, range=10 → doji
            // The first bar's output must NOT be undefined — Doji has
            // lookback=1, so it produces from bar 1.
            expect(seen.has(undefined)).toBe(false);
        });

        it('shared Candles missing bodyAvg throws when used with Hammer', () => {
            const minimal = new debut.Candles({ bodyAvg: false, trend: true, lookback: 1 });
            expect(() => new debut.Hammer(minimal)).toThrow(/bodyAvg/);
        });

        it('shared Candles missing trend throws when used with Hammer', () => {
            const noTrend = new debut.Candles({ bodyAvg: true, trend: false, lookback: 1 });
            expect(() => new debut.Hammer(noTrend)).toThrow(/trend/);
        });

        it('shared Candles with insufficient lookback throws', () => {
            const tooShallow = new debut.Candles({ bodyAvg: true, trend: true, lookback: 2 });
            expect(() => new debut.FallingThreeMethods(tooShallow)).toThrow(/lookback/);
        });
    });

    describe('AllCandlestickPatterns', () => {
        it('matches the same fire-bars as the per-pattern standalone runs', () => {
            const all = new (require('../../src/candlestick').AllCandlestickPatterns)();
            const combined: Record<string, number[]> = {};
            for (const b of bars) {
                const fired: string[] = all.nextValue(b.open, b.high, b.low, b.close);
                for (const name of fired) {
                    if (!combined[name]) combined[name] = [];
                    combined[name].push(b.time);
                }
            }

            // Reconstruct each pattern's expected fires by running it
            // standalone and compare to what the combined detector
            // reported.
            for (const { name, debut: PatternCtor } of pairs) {
                const standalone = new PatternCtor();
                const expected: number[] = [];
                for (const b of bars) {
                    if (standalone.nextValue(b.open, b.high, b.low, b.close) === true) {
                        expected.push(b.time);
                    }
                }
                expect(combined[name] || []).toEqual(expected);
            }
        });
    });
});
