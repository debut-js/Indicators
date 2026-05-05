import { HistoricalVolatility } from '../../src/historical-volatility';
import { calculateHistoricalVolatility } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('HistoricalVolatility cross-SDK', () => {
    it('matches LWC (length=10, annual=365, per=1)', () => {
        const bars = genBars(300);
        const lwc = plotValues(calculateHistoricalVolatility(bars, { length: 10, annual: 365, per: 1 }));
        const hv = new HistoricalVolatility(10, 365, 1);
        const debut = bars.map((b) => hv.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'HV');
    });

    it('matches LWC (length=20, annual=252, per=1)', () => {
        const bars = genBars(500, 41);
        const lwc = plotValues(calculateHistoricalVolatility(bars, { length: 20, annual: 252, per: 1 }));
        const hv = new HistoricalVolatility(20, 252, 1);
        const debut = bars.map((b) => hv.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'HV');
    });
});
