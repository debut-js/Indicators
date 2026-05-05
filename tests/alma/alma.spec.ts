import { ALMA } from '../../src/alma';
import { calculateALMA } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('ALMA cross-SDK', () => {
    it('matches lightweight-charts-indicators (defaults 9, 0.85, 6)', () => {
        const bars = genBars(300);
        const lwc = plotValues(calculateALMA(bars, { lengthInput: 9, offsetInput: 0.85, sigmaInput: 6 }));
        const alma = new ALMA(9, 0.85, 6);
        const debut = bars.map((b) => alma.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'ALMA');
    });

    it('matches lightweight-charts-indicators (21, 0.5, 4)', () => {
        const bars = genBars(500, 7);
        const lwc = plotValues(calculateALMA(bars, { lengthInput: 21, offsetInput: 0.5, sigmaInput: 4 }));
        const alma = new ALMA(21, 0.5, 4);
        const debut = bars.map((b) => alma.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'ALMA');
    });
});
