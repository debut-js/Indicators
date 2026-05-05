import { ADR } from '../../src/adr';
import { calculateADR } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('ADR cross-SDK', () => {
    it('matches LWC (length=14)', () => {
        const bars = genBars(300);
        const lwc = plotValues(calculateADR(bars, { lengthInput: 14 }));
        const adr = new ADR(14);
        const debut = bars.map((b) => adr.nextValue(b.high, b.low));
        assertSeriesMatch(debut, lwc, 1e-9, 'ADR');
    });
});
