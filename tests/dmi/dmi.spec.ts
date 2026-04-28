import { DMI } from '../../src/dmi';

describe('DMI', () => {
    it('is undefined on first bar', () => {
        const d = new DMI(14, false);
        expect(d.nextValue(10, 8, 9)).toBeUndefined();
    });

    it('returns plusDI and minusDI as finite numbers when ready', () => {
        const d = new DMI(3, false);
        const highs = [10, 11, 12, 11, 10, 9, 10, 11, 12, 11, 10, 9, 10, 11, 12, 11, 10, 9, 10];
        const lows = [8, 9, 10, 9, 8, 7, 8, 9, 10, 9, 8, 7, 8, 9, 10, 9, 8, 7, 8];
        const closes = [9, 10, 11, 10, 9, 8, 9, 10, 11, 10, 9, 8, 9, 10, 11, 10, 9, 8, 9];
        let last: { plusDI: number; minusDI: number } | undefined;
        for (let i = 0; i < highs.length; i++) {
            const v = d.nextValue(highs[i], lows[i], closes[i]) as
                | { plusDI: number; minusDI: number }
                | undefined;
            if (v) last = v;
        }
        expect(last).toBeDefined();
        expect(Number.isFinite(last!.plusDI)).toBe(true);
        expect(Number.isFinite(last!.minusDI)).toBe(true);
    });

    it('with ADX includes adx in result', () => {
        const d = new DMI(4, true);
        const h = [10, 12, 11, 10, 12, 11, 10, 12, 11, 10, 12];
        const l = [8, 9, 8, 7, 9, 8, 7, 9, 8, 7, 9];
        const c = [9, 11, 9, 8, 11, 9, 8, 11, 9, 8, 11];
        let last: { adx: number; plusDI: number; minusDI: number } | undefined;
        for (let i = 0; i < h.length; i++) {
            const v = d.nextValue(h[i], l[i], c[i]) as
                | { adx: number; plusDI: number; minusDI: number }
                | undefined;
            if (v && v.adx !== undefined) last = v;
        }
        expect(last).toBeDefined();
        expect(Number.isFinite(last!.adx)).toBe(true);
    });
});
