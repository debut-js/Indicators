import { PSAR } from '../../src/psar';
import { PSAR as PSAR2 } from 'technicalindicators';
import { lows, highs, closes } from './excel-data';

describe('PSAR', () => {
    it('Cross sdk validate', () => {
        const psar = new PSAR();

        const local: number[] = [];
        const cross = PSAR2.calculate({ high: highs, low: lows, step: 0.02, max: 0.2 });

        for (let i = 0; i < lows.length; i++) {
            local.push(psar.nextValue(highs[i], lows[i], closes[i]));
        }

        expect(local).toEqual(cross);
    });
    it('Cross sdk moment value validate', () => {
        const psar = new PSAR();

        const localMoment: number[] = [];
        const cross = PSAR2.calculate({ high: highs, low: lows, step: 0.02, max: 0.2 });

        for (let i = 0; i < lows.length; i++) {
            localMoment.push(psar.momentValue(highs[i], lows[i]));
            psar.nextValue(highs[i], lows[i], closes[i]);
        }

        expect(localMoment).toEqual(cross);
    });
});
