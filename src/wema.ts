import { SMA, SMAState } from './sma';
import { dumpOptionalNumber, OptionalNumberState, restoreOptionalNumber, StatefulIndicator } from './stateful-indicator';

export interface WEMAState {
    period: number;
    smooth: number;
    wema: OptionalNumberState;
    sma: SMAState;
}

/**
 * The WEMA (Wilder's Smoothed Moving Average) is a powerful indicator based on the Simple Moving Average indicator.
 * The Simple Moving Average (SMA) indicator is useful to identify the start and reversal of a trend.
 */
export class WEMA implements StatefulIndicator<WEMAState> {
    private smooth: number;
    private wema: number;
    private sma: SMA;

    constructor(private period: number) {
        this.smooth = 1 / this.period;
        this.sma = new SMA(this.period);
    }

    /**
     * Get next value for closed candle hlc
     * affect all next calculations
     */
    nextValue(value: number) {
        if (this.wema === undefined) {
            return (this.wema = this.sma.nextValue(value));
        }

        return (this.wema = (value - this.wema) * this.smooth + this.wema);
    }

    /**
     * Get next value for non closed (tick) candle hlc
     * does not affect any next calculations
     */
    momentValue(value: number) {
        if (this.wema === undefined) {
            return this.sma.momentValue(value);
        }

        return (value - this.wema) * this.smooth + this.wema;
    }

    dumpState(): WEMAState {
        return {
            period: this.period,
            smooth: this.smooth,
            wema: dumpOptionalNumber(this.wema),
            sma: this.sma.dumpState(),
        };
    }

    restoreState(state: WEMAState): this {
        if (state.period !== this.period) {
            throw new Error(`WEMA period mismatch: expected ${this.period}, got ${state.period}`);
        }

        this.smooth = state.smooth;
        this.wema = restoreOptionalNumber(state.wema);
        this.sma.restoreState(state.sma);

        return this;
    }
}
