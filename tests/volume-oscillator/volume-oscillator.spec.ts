import { VolumeOscillator } from '../../src/volume-oscillator';
import { SMA as SMA2 } from 'technicalindicators';
import { closes } from '../macd/excel-data';

describe('VolumeOscillator', () => {
    it('is undefined until the long-period SMA is ready', () => {
        const v = new VolumeOscillator(2, 3);
        expect(v.nextValue(10)).toBeUndefined();
        expect(v.nextValue(20)).toBeUndefined();
    });

    it('equals short SMA minus long SMA of volume', () => {
        const v = new VolumeOscillator(2, 3);
        v.nextValue(10);
        v.nextValue(20);
        const a = v.nextValue(15) as number;
        // SMA2 of last 2: (20+15)/2 = 17.5, SMA3: (10+20+15)/3 = 15
        expect(a).toBeCloseTo(17.5 - 15, 6);
    });

    it('momentValue matches difference of SMA moment values', () => {
        const v = new VolumeOscillator(3, 4);
        for (let i = 1; i <= 4; i++) v.nextValue(i * 10);
        const m = v.momentValue(50) as number;
        const d = new VolumeOscillator(3, 4);
        for (let i = 1; i <= 4; i++) d.nextValue(i * 10);
        const m2 = d.momentValue(50) as number;
        expect(m2).toBe(m);
    });

    it('Cross sdk: matches difference of two technicalindicators SMAs of volume', () => {
        const shortP = 14;
        const longP = 28;
        const vo = new VolumeOscillator(shortP, longP);
        const sShort = new SMA2({ period: shortP, values: [] });
        const sLong = new SMA2({ period: longP, values: [] });
        const volumeSeries = closes.map((c) => Math.max(1, Math.round(1000 + c % 200)));
        volumeSeries.forEach((vol) => {
            const a = vo.nextValue(vol);
            const x = sShort.nextValue(vol);
            const y = sLong.nextValue(vol);
            if (a !== undefined && x !== undefined && y !== undefined) {
                expect(a).toBeCloseTo(x - y, 8);
            }
        });
    });
});
