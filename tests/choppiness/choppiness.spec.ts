import { Choppiness } from '../../src/choppiness';
import { calculateChoppiness } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('Choppiness Index cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=14)', () => {
        const bars = genBars(400);
        const lwc = plotValues(calculateChoppiness(bars, { length: 14 }));
        const c = new Choppiness(14);
        const debut = bars.map((b) => c.nextValue(b.high, b.low, b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'Choppiness');
    });

    it('matches lightweight-charts-indicators (length=20)', () => {
        const bars = genBars(500, 29);
        const lwc = plotValues(calculateChoppiness(bars, { length: 20 }));
        const c = new Choppiness(20);
        const debut = bars.map((b) => c.nextValue(b.high, b.low, b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'Choppiness');
    });
});
