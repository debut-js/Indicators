import { TrendStrengthIndex } from '../../src/trend-strength';
import { calculateTrendStrength } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('TrendStrengthIndex cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=14)', () => {
        const bars = genBars(400);
        const lwc = plotValues(calculateTrendStrength(bars, { length: 14 }));
        const tsi = new TrendStrengthIndex(14);
        const debut = bars.map((b) => tsi.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'TrendStrength');
    });

    it('matches lightweight-charts-indicators (length=30)', () => {
        const bars = genBars(500, 37);
        const lwc = plotValues(calculateTrendStrength(bars, { length: 30 }));
        const tsi = new TrendStrengthIndex(30);
        const debut = bars.map((b) => tsi.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'TrendStrength');
    });
});
