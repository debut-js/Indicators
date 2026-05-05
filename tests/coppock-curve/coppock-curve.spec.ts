import { CoppockCurve } from '../../src/coppock-curve';
import { calculateCoppockCurve } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('Coppock Curve cross-SDK', () => {
    it('matches lightweight-charts-indicators (defaults 10/14/11)', () => {
        const bars = genBars(400);
        const lwc = plotValues(
            calculateCoppockCurve(bars, { wmaLength: 10, longRocLength: 14, shortRocLength: 11 }),
        );
        const cc = new CoppockCurve(10, 14, 11);
        const debut = bars.map((b) => cc.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'CoppockCurve');
    });

    it('matches lightweight-charts-indicators (8/12/9)', () => {
        const bars = genBars(300, 73);
        const lwc = plotValues(
            calculateCoppockCurve(bars, { wmaLength: 8, longRocLength: 12, shortRocLength: 9 }),
        );
        const cc = new CoppockCurve(8, 12, 9);
        const debut = bars.map((b) => cc.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'CoppockCurve');
    });
});
