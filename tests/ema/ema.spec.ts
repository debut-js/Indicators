import { EMA } from '../../src/ema';
import { EMA as EMA2 } from 'technicalindicators';
import { emaValues, closes } from './excel-data';

function jsonRoundTrip<T>(state: T): T {
    return JSON.parse(JSON.stringify(state));
}

describe('EMA', () => {
    it('Excel Validate', () => {
        const ema = new EMA(10);

        closes.forEach((c, idx) => {
            const calculated = ema.nextValue(c);
            const excel = emaValues[idx];

            if (!excel && !calculated) {
                expect(excel).toEqual(calculated);
            } else {
                expect(Math.abs(calculated! - excel!)).toBeLessThan(0.0001);
            }
        });
    });

    it('Cross sdk validate', () => {
        const ema = new EMA(14);
        const ema2 = new EMA2({ period: 14, values: [] });

        closes.forEach((c) => {
            const local = ema.nextValue(c);
            const cross = ema2.nextValue(c);

            expect(local).toEqual(cross);
        });
    });

    it('calculates momentValue after runtime warmup without restoreState', () => {
        const ema = new EMA(3);
        const warmupMomentValue = ema.momentValue;

        expect(ema.momentValue(10)).toBeUndefined();
        expect(ema.nextValue(1)).toBeUndefined();
        expect(ema.momentValue).toBe(warmupMomentValue);
        expect(ema.momentValue(10)).toBeUndefined();
        expect(ema.nextValue(2)).toBeUndefined();
        expect(ema.nextValue(3)).toBe(2);

        expect(ema.momentValue).not.toBe(warmupMomentValue);
        expect(ema.momentValue(10)).toBe(6);
        expect(ema.nextValue(4)).toBe(3);
        expect(ema.momentValue(10)).toBe(6.5);
    });

    it('calculates momentValue when runtime warmup average is zero', () => {
        const ema = new EMA(3);

        ema.nextValue(0);
        ema.nextValue(0);
        expect(ema.nextValue(0)).toBe(0);

        expect(ema.momentValue(6)).toBe(3);
        expect(ema.nextValue(6)).toBe(3);
    });

    it('restores momentValue to the same runtime behavior', () => {
        const runtime = new EMA(3);
        const restored = new EMA(3);

        [1, 2, 3, 4].forEach((value: number): void => {
            runtime.nextValue(value);
        });
        restored.restoreState(jsonRoundTrip(runtime.dumpState()));

        expect(restored.momentValue(10)).toBe(runtime.momentValue(10));
        expect(restored.nextValue(10)).toBe(runtime.nextValue(10));
    });
});
