import { RVI } from '../../src/rvi';
import { calculateRVI } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('RVI (Relative Vigor Index) cross-SDK', () => {
    it('matches LWC (length=10)', () => {
        const bars = genBars(400);
        const result = calculateRVI(bars, { length: 10, offset: 0 });
        const lwcRvi = plotValues(result, 'plot0');
        const lwcSig = plotValues(result, 'plot1');

        const rvi = new RVI(10);
        const debutRvi: Array<number | undefined> = [];
        const debutSig: Array<number | undefined> = [];
        for (const b of bars) {
            const out = rvi.nextValue(b.open, b.high, b.low, b.close);
            debutRvi.push(out?.rvi);
            debutSig.push(out?.signal);
        }
        assertSeriesMatch(debutRvi, lwcRvi, 1e-9, 'RVI');
        assertSeriesMatch(debutSig, lwcSig, 1e-9, 'RVI.signal');
    });
});
