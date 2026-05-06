import { VolumeProfile, Candle } from '../../src/volume-profile';
import data from './data';

const c = (o: number, h: number, l: number, c: number, v: number, time = 0): Candle => ({
    o, h, l, c, v, time,
});

describe('VolumeProfile', () => {
    describe("'close' distribution — hand-verified POC / VAH / VAL", () => {
        // Three candles closing at 100, 105, 100 with volume 10 each.
        // Row 100 → 20, row 105 → 10. POC = 100 (highest volume).
        // Total = 30, value-area target (70%) = 21.
        //   start at POC: cumulative = 20
        //   look above (row 105 = 10) vs below (none = 0) → add above
        //   cumulative = 30 ≥ 21 → stop
        // VAL = 100 (lower edge of row 100), VAH = 105 + 1 = 106 (upper edge of row 105).
        it('matches the expected histogram', () => {
            const vp = new VolumeProfile({ tickSize: 1, distribution: 'close' });
            vp.nextValue(c(99, 101, 99, 100, 10));
            vp.nextValue(c(104, 106, 104, 105, 10));
            vp.nextValue(c(99, 101, 99, 100, 10));

            expect(vp.totalVolume()).toBe(30);
            expect(vp.poc()).toBe(100);
            const va = vp.valueArea();
            expect(va).toEqual({ val: 100, vah: 106 });
        });

        it('expands the value area to the higher-volume side first', () => {
            // Asymmetric volumes: 10 @ 100, 5 @ 99, 8 @ 101.
            // POC = 100 (10).  total = 23, target = 16.1.
            //   cumulative = 10
            //   above (101 = 8) > below (99 = 5) → add above → 18 ≥ 16.1, stop.
            // VAL = 100, VAH = 101 + 1 = 102. (99 is OUTSIDE the area.)
            const vp = new VolumeProfile({ tickSize: 1, distribution: 'close' });
            vp.nextValue(c(100, 100, 100, 100, 10));
            vp.nextValue(c(99, 99, 99, 99, 5));
            vp.nextValue(c(101, 101, 101, 101, 8));

            expect(vp.poc()).toBe(100);
            expect(vp.valueArea()).toEqual({ val: 100, vah: 102 });
        });
    });

    describe("'uniform' distribution", () => {
        it("spreads a candle's volume across every row in [low, high]", () => {
            // candle o=100, h=104, l=100, c=102, v=12, tickSize=1
            //   rows touched: 100, 101, 102, 103, 104  (5 rows)
            //   per-row contribution: 12 / 5 = 2.4
            const vp = new VolumeProfile({ tickSize: 1, distribution: 'uniform' });
            vp.nextValue(c(100, 104, 100, 102, 12));

            expect(vp.totalVolume()).toBeCloseTo(12, 9);
            const profile = vp.profile();
            expect(profile.map((r) => r.price)).toEqual([100, 101, 102, 103, 104]);
            for (const r of profile) expect(r.volume).toBeCloseTo(2.4, 9);
        });

        it('honours non-integer tickSize', () => {
            // tickSize = 0.5, candle range [10.0, 11.0] → rows at
            // 10.0, 10.5, 11.0  (3 rows). v = 9 → 3 per row.
            const vp = new VolumeProfile({ tickSize: 0.5, distribution: 'uniform' });
            vp.nextValue(c(10, 11, 10, 10.5, 9));

            const profile = vp.profile();
            expect(profile.map((r) => r.price)).toEqual([10, 10.5, 11]);
            for (const r of profile) expect(r.volume).toBeCloseTo(3, 9);
        });
    });

    describe('configurable Value Area percentage', () => {
        it('honours valueAreaPercent', () => {
            const vp = new VolumeProfile({ tickSize: 1, distribution: 'close', valueAreaPercent: 1.0 });
            vp.nextValue(c(100, 100, 100, 100, 10));
            vp.nextValue(c(105, 105, 105, 105, 10));
            // 100% Value Area covers every populated row.
            expect(vp.valueArea()).toEqual({ val: 100, vah: 106 });
        });
    });

    describe("session: 'daily' anchoring", () => {
        it('resets the histogram on a UTC-day boundary', () => {
            const vp = new VolumeProfile({ tickSize: 1, distribution: 'close', session: 'daily' });
            // Day 1: 2024-01-01 12:00 UTC.
            const day1 = Date.UTC(2024, 0, 1, 12);
            vp.nextValue(c(100, 100, 100, 100, 5, day1));
            vp.nextValue(c(101, 101, 101, 101, 5, day1 + 60_000));
            expect(vp.totalVolume()).toBe(10);

            // Day 2: 2024-01-02 00:30 UTC — different UTC day → reset.
            const day2 = Date.UTC(2024, 0, 2, 0, 30);
            vp.nextValue(c(200, 200, 200, 200, 7, day2));
            expect(vp.totalVolume()).toBe(7);
            expect(vp.poc()).toBe(200);
            expect(vp.sessionStart()).toBe(day2);
        });
    });

    describe('session: { lookback: N } rolling window', () => {
        it('evicts old bars beyond the window', () => {
            const vp = new VolumeProfile({ tickSize: 1, distribution: 'close', session: { lookback: 3 } });
            vp.nextValue(c(100, 100, 100, 100, 10));
            vp.nextValue(c(101, 101, 101, 101, 10));
            vp.nextValue(c(102, 102, 102, 102, 10));
            expect(vp.totalVolume()).toBeCloseTo(30, 9);
            expect(vp.poc()).toBe(100); // smallest tied index

            // 4th bar evicts the 1st (row 100).
            vp.nextValue(c(103, 103, 103, 103, 10));
            expect(vp.totalVolume()).toBeCloseTo(30, 9);
            const rows = vp.profile().map((r) => r.price);
            expect(rows).toEqual([101, 102, 103]);
        });
    });

    describe('momentValue previews without committing state', () => {
        it('reports the same snapshot a committed nextValue would, but leaves state untouched', () => {
            const live = new VolumeProfile({ tickSize: 1, distribution: 'close' });
            const preview = new VolumeProfile({ tickSize: 1, distribution: 'close' });
            // Seed both with identical history.
            for (let i = 0; i < 10; i++) {
                live.nextValue(c(100 + i, 100 + i, 100 + i, 100 + i, 5));
                preview.nextValue(c(100 + i, 100 + i, 100 + i, 100 + i, 5));
            }

            // Snapshot before the hypothetical bar.
            const beforePoc = preview.poc();
            const beforeTotal = preview.totalVolume();

            // Preview a hypothetical bar.
            const candidate = c(110, 110, 110, 110, 100);
            const previewed = preview.momentValue(candidate);

            // Compare against committing the same bar on `live`.
            const committed = live.nextValue(candidate);
            expect(previewed).toEqual(committed);

            // `preview` must be byte-for-byte unchanged.
            expect(preview.poc()).toBe(beforePoc);
            expect(preview.totalVolume()).toBeCloseTo(beforeTotal, 9);
        });

        it('previews correctly inside a lookback window (eviction-aware)', () => {
            const live = new VolumeProfile({ tickSize: 1, distribution: 'close', session: { lookback: 3 } });
            const preview = new VolumeProfile({ tickSize: 1, distribution: 'close', session: { lookback: 3 } });
            const seed = [
                c(100, 100, 100, 100, 10),
                c(101, 101, 101, 101, 10),
                c(102, 102, 102, 102, 10),
            ];
            for (const k of seed) {
                live.nextValue(k);
                preview.nextValue(k);
            }
            const candidate = c(103, 103, 103, 103, 10);
            const previewed = preview.momentValue(candidate);
            const committed = live.nextValue(candidate);
            expect(previewed).toEqual(committed);
            // Preview state must not have evicted anything.
            expect(preview.profile().map((r) => r.price)).toEqual([100, 101, 102]);
        });
    });

    describe('reset() clears everything', () => {
        it('returns undefined for POC and value area after reset', () => {
            const vp = new VolumeProfile({ tickSize: 1, distribution: 'close' });
            vp.nextValue(c(100, 100, 100, 100, 5));
            vp.reset();
            expect(vp.totalVolume()).toBe(0);
            expect(vp.poc()).toBeUndefined();
            expect(vp.valueArea()).toBeUndefined();
            expect(vp.sessionStart()).toBeUndefined();
        });
    });

    describe('FX dataset smoke test', () => {
        it('produces a finite, ordered profile over real-ish data', () => {
            // Override the new `'daily'` default — the FX dataset spans
            // several UTC days, and we want a single histogram covering
            // all of it so the value-area sanity assertions are
            // meaningful.
            const vp = new VolumeProfile({
                tickSize: 0.001,
                distribution: 'uniform',
                session: 'continuous',
            });
            for (const k of data) vp.nextValue(k as Candle);

            const profile = vp.profile();
            // Profile must be sorted by price ascending and contain
            // strictly positive volumes everywhere.
            for (let i = 1; i < profile.length; i++) {
                expect(profile[i].price).toBeGreaterThan(profile[i - 1].price);
            }
            for (const row of profile) expect(row.volume).toBeGreaterThan(0);

            const poc = vp.poc();
            const va = vp.valueArea();
            expect(poc).toBeDefined();
            expect(va).toBeDefined();
            // POC sits inside the value area envelope.
            expect(va!.val).toBeLessThanOrEqual(poc as number);
            expect(va!.vah).toBeGreaterThan(poc as number);
            // Cumulative volume inside the value area must reach the
            // 70% target (within a small float tolerance).
            const inside = profile
                .filter((r) => r.price >= va!.val && r.price < va!.vah)
                .reduce((s, r) => s + r.volume, 0);
            expect(inside).toBeGreaterThanOrEqual(vp.totalVolume() * 0.7 - 1e-6);
        });
    });
});
