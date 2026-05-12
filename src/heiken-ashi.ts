import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Heikin-Ashi Candlesticks are an offshoot from Japanese candlesticks.
 * Heikin-Ashi Candlesticks use the open-close data from the prior period
 * and the open-high-low-close data from the current period to create a combo candlestick.
 * The resulting candlestick filters out some noise in an effort to better capture the trend.
 * In Japanese, Heikin means “average” and Ashi means “pace” (EUDict.com).
 * Taken together, Heikin-Ashi represents the average pace of prices.
 * Heikin-Ashi Candlesticks are not used like normal candlesticks.
 * Dozens of bullish or bearish reversal patterns consisting of 1-3 candlesticks are not to be found.
 * Instead, these candlesticks can be used to identify trending periods,
 * potential reversal points and classic technical analysis patterns.
 */
export class HeikenAshi  implements StatefulIndicator<GenericIndicatorState> {
    private prevOpen = 0;
    private prevClose = 0;

    /**
     * Get next value for closed candle hlc
     * affect all next calculations
     */
    nextValue(o: number, h: number, l: number, c: number) {
        const data = this.calculate(o, h, l, c);

        this.prevClose = data.c;
        this.prevOpen = data.o;

        return data;
    }

    /**
     * Get next value for non closed (tick) candle hlc
     * does not affect any next calculations
     */
    momentValue(o: number, h: number, l: number, c: number) {
        return this.calculate(o, h, l, c);
    }

    /**
     * Heiken ashi formula
     */
    calculate(o: number, h: number, l: number, c: number) {
        c = (o + h + l + c) / 4;

        if (this.prevOpen) {
            o = (this.prevOpen + this.prevClose) / 2;
        }

        h = Math.max(h, o, c);
        l = Math.min(l, o, c);

        return { o, h, l, c };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
