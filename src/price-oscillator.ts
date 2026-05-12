import { EMA } from './ema';
import { SMA } from './sma';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Price Oscillator (PPO)
 *
 *   ppo       = ((shortMA - longMA) / longMA) * 100
 *   signal    = MA(ppo, signalLength)
 *   histogram = ppo - signal
 *
 * `exponential` toggles between EMA-based (default — classic Percent
 * Price Oscillator) and SMA-based smoothing. Defaults follow LWC:
 * short=12, long=26, signal=9.
 */
export class PriceOscillator  implements StatefulIndicator<GenericIndicatorState> {
    private shortMA: EMA | SMA;
    private longMA: EMA | SMA;
    private signalMA: EMA | SMA;

    constructor(shortLength = 12, longLength = 26, signalLength = 9, exponential = true) {
        if (exponential) {
            this.shortMA = new EMA(shortLength);
            this.longMA = new EMA(longLength);
            this.signalMA = new EMA(signalLength);
        } else {
            this.shortMA = new SMA(shortLength);
            this.longMA = new SMA(longLength);
            this.signalMA = new SMA(signalLength);
        }
    }

    nextValue(value: number) {
        const s = this.shortMA.nextValue(value);
        const l = this.longMA.nextValue(value);
        if (s === undefined || l === undefined || l === 0) return;
        const ppo = ((s - l) / l) * 100;
        const signal = this.signalMA.nextValue(ppo);
        const histogram = signal === undefined ? undefined : ppo - signal;
        return { ppo, signal, histogram };
    }

    momentValue(value: number) {
        const s = this.shortMA.momentValue(value);
        const l = this.longMA.momentValue(value);
        if (s === undefined || l === undefined || l === 0) return;
        const ppo = ((s - l) / l) * 100;
        const signal = this.signalMA.momentValue(ppo);
        const histogram = signal === undefined ? undefined : ppo - signal;
        return { ppo, signal, histogram };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
