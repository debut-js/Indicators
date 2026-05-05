import { HMA } from '../../src/hma';
import { calculateHMA } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('HMA cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=9)', () => {
        const bars = genBars(300);
        const lwc = plotValues(calculateHMA(bars, { length: 9 }));

        const hma = new HMA(9);
        const debut = bars.map((b) => hma.nextValue(b.close));

        assertSeriesMatch(debut, lwc, 1e-9, 'HMA');
    });

    it('matches lightweight-charts-indicators (length=21)', () => {
        const bars = genBars(500, 7);
        const lwc = plotValues(calculateHMA(bars, { length: 21 }));

        const hma = new HMA(21);
        const debut = bars.map((b) => hma.nextValue(b.close));

        assertSeriesMatch(debut, lwc, 1e-9, 'HMA');
    });
});
