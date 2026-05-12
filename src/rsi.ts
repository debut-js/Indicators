import { AvgChangeProvider, AvgChangeProviderState } from './providers/gain';
import { StatefulIndicator } from './stateful-indicator';

export interface RSIState {
    period: number;
    change: AvgChangeProviderState;
}

/**
 * The relative strength index (RSI) is a momentum indicator used in technical analysis
 * that measures the magnitude of recent price changes to evaluate overbought or oversold conditions
 * in the price of a stock or other asset. The RSI is displayed as an oscillator
 * (a line graph that moves between two extremes) and can have a reading from 0 to 100.
 * The indicator was originally developed by J. Welles Wilder Jr. and introduced in his seminal 1978 book,
 * "New Concepts in Technical Trading Systems."
 *
 * Traditional interpretation and usage of the RSI are that values of 70 or above indicate
 * that a security is becoming overbought or overvalued and may be primed
 * for a trend reversal or corrective pullback in price.
 * An RSI reading of 30 or below indicates an oversold or undervalued condition.
 */
export class RSI implements StatefulIndicator<RSIState> {
    private change: AvgChangeProvider;

    constructor(private period = 14) {
        this.change = new AvgChangeProvider(this.period);
    }

    nextValue(value: number) {
        const { downAvg, upAvg } = this.change.nextValue(value) || {};

        if (upAvg === undefined || downAvg === undefined) {
            return;
        }

        const RS = upAvg / -downAvg;

        return 100 - 100 / (1 + RS);
    }

    momentValue(value: number) {
        const { downAvg, upAvg } = this.change.momentValue(value) || {};

        if (upAvg === undefined || downAvg === undefined) {
            return;
        }

        const RS = upAvg / -downAvg;

        return 100 - 100 / (1 + RS);
    }

    dumpState(): RSIState {
        return {
            period: this.period,
            change: this.change.dumpState(),
        };
    }

    restoreState(state: RSIState): this {
        if (state.period !== this.period) {
            throw new Error(`RSI period mismatch: expected ${this.period}, got ${state.period}`);
        }

        this.change.restoreState(state.change);

        return this;
    }
}
