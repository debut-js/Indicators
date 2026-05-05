import { RelativeVolatilityIndex } from '../../src/relative-volatility-index';
import { calculateRelativeVolatilityIndex } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('RelativeVolatilityIndex cross-SDK', () => {
    it('matches LWC (length=10, no smoothing)', () => {
        const bars = genBars(400);
        const lwc = plotValues(
            calculateRelativeVolatilityIndex(bars, {
                length: 10,
                offset: 0,
                maType: 'None',
                maLength: 14,
                bbMult: 2,
            }),
        );
        const rvol = new RelativeVolatilityIndex(10);
        const debut = bars.map((b) => rvol.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'RVOL');
    });

    it('matches LWC (length=20)', () => {
        const bars = genBars(500, 51);
        const lwc = plotValues(
            calculateRelativeVolatilityIndex(bars, {
                length: 20,
                offset: 0,
                maType: 'None',
                maLength: 14,
                bbMult: 2,
            }),
        );
        const rvol = new RelativeVolatilityIndex(20);
        const debut = bars.map((b) => rvol.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'RVOL');
    });
});
