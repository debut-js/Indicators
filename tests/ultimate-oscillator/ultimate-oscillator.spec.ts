import { UltimateOscillator } from '../../src/ultimate-oscillator';

describe('UltimateOscillator', () => {
    it('stays in 0..100 for random OHLC stream', () => {
        const uo = new UltimateOscillator(7, 14, 28);
        for (let i = 0; i < 50; i++) {
            const c = 100 + Math.sin(i) * 5;
            const h = c + 0.1;
            const l = c - 0.1;
            const v = uo.nextValue(h, l, c) as number | undefined;
            if (v !== undefined) {
                expect(v).toBeGreaterThanOrEqual(0);
                expect(v).toBeLessThanOrEqual(100);
            }
        }
    });

    it('momentValue does not throw after warmup', () => {
        const uo = new UltimateOscillator(2, 3, 4);
        for (let i = 0; i < 5; i++) uo.nextValue(10, 8, 9);
        const m = uo.momentValue(10, 7, 9) as number;
        expect(Number.isFinite(m)).toBe(true);
    });
});
