import { BullBearPower } from '../../src/bull-bear-power';
import { calculateBullBearPower } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('BullBearPower cross-SDK', () => {
    it('matches LWC (length=13)', () => {
        const bars = genBars(300);
        const lwc = plotValues(calculateBullBearPower(bars, { length: 13 }));
        const bbp = new BullBearPower(13);
        const debut = bars.map((b) => bbp.nextValue(b.high, b.low, b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'BBP');
    });

    it('matches LWC (length=21)', () => {
        const bars = genBars(500, 47);
        const lwc = plotValues(calculateBullBearPower(bars, { length: 21 }));
        const bbp = new BullBearPower(21);
        const debut = bars.map((b) => bbp.nextValue(b.high, b.low, b.close));
        assertSeriesMatch(debut, lwc, 1e-9, 'BBP');
    });
});
