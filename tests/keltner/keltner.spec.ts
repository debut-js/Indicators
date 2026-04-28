import { KeltnerChannel } from '../../src/keltner';
import { KeltnerChannels } from 'technicalindicators';
import { closes } from '../macd/excel-data';
import { ohlc } from '../cci/excel-data';
import { EMA } from '../../src/ema';
import { ATR } from '../../src/atr';

describe('KeltnerChannel', () => {
    it('bands are symmetric around EMA for a fixed multiplier', () => {
        const k = new KeltnerChannel(3, 2);
        for (let i = 0; i < 10; i++) {
            k.nextValue(10, 8, 9);
        }
        const v = k.nextValue(10, 8, 9) as { lower: number; middle: number; upper: number };
        expect(Number.isFinite(v.upper)).toBe(true);
        expect(v.upper - v.middle).toBeCloseTo(v.middle - v.lower, 5);
    });

    it('matches EMA plus/minus 2*ATR from standalone indicators', () => {
        const period = 5;
        const m = 2;
        const kc = new KeltnerChannel(period, m);
        const ema = new EMA(period);
        const atr = new ATR(period);
        for (const c of closes) {
            const o = c + 0.1;
            const h = c + 0.5;
            const l = c - 0.5;
            kc.nextValue(h, l, c);
            ema.nextValue(c);
            atr.nextValue(h, l, c);
        }
        const last = closes[closes.length - 1];
        const h2 = last + 0.5;
        const l2 = last - 0.5;
        const ku = kc.momentValue(h2, l2, last) as { lower: number; middle: number; upper: number };
        const mid = ema.momentValue(last);
        const a = atr.momentValue(h2, l2) as number;
        expect(ku.middle).toBeCloseTo(mid, 5);
        expect(ku.upper).toBeCloseTo(mid + m * a, 5);
        expect(ku.lower).toBeCloseTo(mid - m * a, 5);
    });

    it('Cross sdk: matches technicalindicators KeltnerChannels (EMA middle, WEMA ATR)', () => {
        const period = 20;
        const mult = 2;
        const kc = new KeltnerChannel(period, mult);
        const ref = new KeltnerChannels({
            maPeriod: period,
            atrPeriod: period,
            useSMA: false,
            multiplier: mult,
            high: [],
            low: [],
            close: []
        });
        const eps = 0.01;
        ohlc.forEach((bar) => {
            const a = kc.nextValue(bar.h, bar.l, bar.c) as
                | { lower: number; middle: number; upper: number }
                | undefined;
            const b = ref.nextValue({ high: bar.h, low: bar.l, close: bar.c } as any) as
                | { lower: number; middle: number; upper: number }
                | undefined;
            if (a && b) {
                expect(Math.abs(a.middle - b.middle)).toBeLessThan(eps);
                expect(Math.abs(a.upper - b.upper)).toBeLessThan(eps);
                expect(Math.abs(a.lower - b.lower)).toBeLessThan(eps);
            }
        });
    });
});
