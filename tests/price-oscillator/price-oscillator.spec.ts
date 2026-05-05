import { PriceOscillator } from '../../src/price-oscillator';
import { calculatePriceOscillator } from 'lightweight-charts-indicators';
import { genBars, plotValues, assertSeriesMatch } from '../lwc-fixtures';

describe('PriceOscillator cross-SDK', () => {
    it('matches LWC (defaults exponential, 12/26/9)', () => {
        const bars = genBars(400);
        const result = calculatePriceOscillator(bars, {
            shortLength: 12, longLength: 26, signalLength: 9, src: 'close', exponential: true,
        });
        // plot0 = histogram, plot1 = ppo, plot2 = signal
        const lwcHist = plotValues(result, 'plot0');
        const lwcPpo = plotValues(result, 'plot1');
        const lwcSig = plotValues(result, 'plot2');

        const po = new PriceOscillator(12, 26, 9, true);
        const debutPpo: Array<number | undefined> = [];
        const debutSig: Array<number | undefined> = [];
        const debutHist: Array<number | undefined> = [];
        for (const b of bars) {
            const out = po.nextValue(b.close);
            debutPpo.push(out?.ppo);
            debutSig.push(out?.signal);
            debutHist.push(out?.histogram);
        }
        assertSeriesMatch(debutPpo, lwcPpo, 1e-9, 'PPO');
        assertSeriesMatch(debutSig, lwcSig, 1e-9, 'PPO.signal');
        assertSeriesMatch(debutHist, lwcHist, 1e-9, 'PPO.histogram');
    });

    it('matches LWC (SMA, 10/20/5)', () => {
        const bars = genBars(300, 31);
        const result = calculatePriceOscillator(bars, {
            shortLength: 10, longLength: 20, signalLength: 5, src: 'close', exponential: false,
        });
        const lwcPpo = plotValues(result, 'plot1');

        const po = new PriceOscillator(10, 20, 5, false);
        const debutPpo = bars.map((b) => po.nextValue(b.close)?.ppo);
        assertSeriesMatch(debutPpo, lwcPpo, 1e-9, 'PPO');
    });
});
