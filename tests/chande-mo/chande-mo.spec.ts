import { ChandeMO } from '../../src/chande-mo';
import { calculateChandeMO } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('ChandeMO cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=9)', () => {
        const bars = genBars(300);
        const lwc = plotValues(calculateChandeMO(bars, { length: 9 }));
        const cmo = new ChandeMO(9);
        const debut = bars.map((b) => cmo.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'ChandeMO');
    });

    it('matches lightweight-charts-indicators (length=20)', () => {
        const bars = genBars(500, 17);
        const lwc = plotValues(calculateChandeMO(bars, { length: 20 }));
        const cmo = new ChandeMO(20);
        const debut = bars.map((b) => cmo.nextValue(b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'ChandeMO');
    });
});
