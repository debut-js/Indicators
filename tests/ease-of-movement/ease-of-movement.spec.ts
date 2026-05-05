import { EaseOfMovement } from '../../src/ease-of-movement';
import { calculateEOM } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('EOM cross-SDK', () => {
    it('matches lightweight-charts-indicators (length=14, divisor=10000)', () => {
        const bars = genBars(400);
        const lwc = plotValues(calculateEOM(bars, { length: 14, divisor: 10000 }));
        const eom = new EaseOfMovement(14, 10000);
        const debut = bars.map((b) => eom.nextValue(b.high, b.low, b.volume));
        assertSeriesMatch(debut, lwc, 1e-9, 'EOM');
    });
});
