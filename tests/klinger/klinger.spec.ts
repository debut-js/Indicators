import { Klinger } from '../../src/klinger';
import { calculateKlinger } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('Klinger Oscillator cross-SDK', () => {
    it('matches lightweight-charts-indicators (defaults 34/55/13)', () => {
        const bars = genBars(500);
        const result = calculateKlinger(bars, { fastLength: 34, slowLength: 55, signalLength: 13 });
        const lwcKvo = plotValues(result, 'plot0');
        const lwcSig = plotValues(result, 'plot1');

        const k = new Klinger(34, 55, 13);
        const debutKvo: Array<number | undefined> = [];
        const debutSig: Array<number | undefined> = [];
        for (const b of bars) {
            const out = k.nextValue(b.high, b.low, b.close, b.volume);
            debutKvo.push(out?.kvo);
            debutSig.push(out?.signal);
        }
        assertSeriesMatch(debutKvo, lwcKvo, 1e-9, 'Klinger.kvo');
        assertSeriesMatch(debutSig, lwcSig, 1e-9, 'Klinger.signal');
    });
});
