/**
 * Shared synthetic OHLCV fixture used by cross-SDK tests against
 * `lightweight-charts-indicators`. The series is deterministic
 * (seeded LCG) so the oracle and the debut port consume identical
 * inputs across runs and machines.
 */

export interface LwcBar {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

class LCG {
    private state: number;
    constructor(seed: number) {
        this.state = seed >>> 0 || 1;
    }
    next() {
        // Numerical Recipes LCG
        this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
        return this.state / 0xffffffff;
    }
}

export function genBars(count: number, seed = 42): LwcBar[] {
    const rng = new LCG(seed);
    const bars: LwcBar[] = [];
    let price = 100;

    for (let i = 0; i < count; i++) {
        const drift = (rng.next() - 0.5) * 2;
        const open = price;
        const close = +(price + drift).toFixed(4);
        const high = +(Math.max(open, close) + rng.next() * 0.5).toFixed(4);
        const low = +(Math.min(open, close) - rng.next() * 0.5).toFixed(4);
        const volume = +(1000 + rng.next() * 500).toFixed(2);

        bars.push({ time: i + 1, open, high, low, close, volume });
        price = close;
    }

    return bars;
}

/**
 * Pull a single plot's value array out of an LWC `IndicatorResult`.
 * LWC encodes each plot as `Array<{ time, value }>`; we return just
 * the values (NaN preserved) so they line up by index with debut's
 * streaming output.
 */
export function plotValues(result: any, plotId = 'plot0'): number[] {
    const arr = result?.plots?.[plotId];
    if (!Array.isArray(arr)) {
        throw new Error(`plot ${plotId} missing in lwc result`);
    }
    return arr.map((p: { value: number }) => p.value);
}

/**
 * Compare a streaming debut output against an LWC plot array.
 * Treats `undefined` from debut as equivalent to `NaN` from LWC
 * (warmup) and asserts numeric closeness elsewhere.
 */
export function assertSeriesMatch(
    debut: Array<number | undefined>,
    lwc: number[],
    epsilon = 1e-9,
    label = 'series',
) {
    expect(debut.length).toBe(lwc.length);
    for (let i = 0; i < lwc.length; i++) {
        const d = debut[i];
        const l = lwc[i];
        const lwcMissing = l === undefined || l === null || Number.isNaN(l);
        const debutMissing = d === undefined || (typeof d === 'number' && Number.isNaN(d));

        if (lwcMissing) {
            expect(debutMissing).toBe(true);
            continue;
        }

        expect(debutMissing).toBe(false);
        const diff = Math.abs((d as number) - l);
        if (diff >= epsilon) {
            throw new Error(
                `${label}[${i}] mismatch: debut=${d} lwc=${l} diff=${diff} (eps=${epsilon})`,
            );
        }
    }
}
