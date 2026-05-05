import { BOP } from '../../src/bop';
import { calculateBOP } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('BOP cross-SDK', () => {
    it('matches lightweight-charts-indicators', () => {
        const bars = genBars(400);
        const lwc = plotValues(calculateBOP(bars));
        const bop = new BOP();
        const debut = bars.map((b) => bop.nextValue(b.open, b.high, b.low, b.close));
        assertSeriesMatch(debut, lwc, 1e-12, 'BOP');
    });
});
