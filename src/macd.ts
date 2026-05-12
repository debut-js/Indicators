import { EMA } from './ema';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/*
How work MACD?
https://www.investopedia.com/terms/m/macd.asp#:~:text=The%20MACD%20is%20calculated%20by,for%20buy%20and%20sell%20signals.
*/

export class MACD  implements StatefulIndicator<GenericIndicatorState> {
    private emaFastIndicator: EMA;
    private emaSlowIndicator: EMA;
    private emaSignalIndicator: EMA;

    constructor(private periodEmaFast = 12, private periodEmaSlow = 26, private periodSignal = 9) {
        this.emaFastIndicator = new EMA(periodEmaFast);
        this.emaSlowIndicator = new EMA(periodEmaSlow);
        this.emaSignalIndicator = new EMA(periodSignal);
    }

    nextValue(value: number) {
        const emaFast = this.emaFastIndicator.nextValue(value);
        const emaSlow = this.emaSlowIndicator.nextValue(value);
        const macd = emaFast - emaSlow;
        const signal = (macd && this.emaSignalIndicator.nextValue(macd)) || undefined;
        const histogram = macd - signal || undefined;

        if (isNaN(macd)) {
            return;
        }

        return {
            macd,
            emaFast,
            emaSlow,
            signal,
            histogram,
        };
    }

    momentValue(value: number) {
        const emaFast = this.emaFastIndicator.momentValue(value);
        const emaSlow = this.emaSlowIndicator.momentValue(value);
        const macd = emaFast - emaSlow;
        const signal = macd && this.emaSignalIndicator.momentValue(macd);
        const histogram = macd - signal;

        return {
            macd,
            emaFast,
            emaSlow,
            signal,
            histogram,
        };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
