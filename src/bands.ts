import { SMA, SMAState } from './sma';
import { StandardDeviation, StandardDeviationState } from './providers/standard-deviation';
import { StatefulIndicator } from './stateful-indicator';

export interface BollingerBandsValue {
    lower: number;
    middle: number;
    upper: number;
}

export interface BollingerBandsState {
    period: number;
    stdDev: number;
    fill: number;
    sma: SMAState;
    sd: StandardDeviationState;
}

export class BollingerBands implements StatefulIndicator<BollingerBandsState> {
    private sd: StandardDeviation;
    private sma: SMA;
    private fill = 0;

    constructor(private period = 20, private stdDev: number = 2) {
        this.sma = new SMA(period);
        this.sd = new StandardDeviation(period);
    }

    nextValue(close: number): BollingerBandsValue {
        const middle = this.sma.nextValue(close);
        const sd = this.sd.nextValue(close, middle);

        this.fill++;

        if (this.fill !== this.period) {
            return;
        }

        const lower = middle - this.stdDev * sd;
        const upper = middle + this.stdDev * sd;

        this.nextValue = (close: number): BollingerBandsValue => {
            const middle = this.sma.nextValue(close);
            const sd = this.sd.nextValue(close, middle);
            const lower = middle - this.stdDev * sd;
            const upper = middle + this.stdDev * sd;

            return { lower, middle, upper };
        };

        return { lower, middle, upper };
    }

    momentValue(close: number): BollingerBandsValue {
        const middle = this.sma.momentValue(close);
        const sd = this.sd.momentValue(close, middle);
        const lower = middle - this.stdDev * sd;
        const upper = middle + this.stdDev * sd;

        return { lower, middle, upper };
    }

    dumpState(): BollingerBandsState {
        return {
            period: this.period,
            stdDev: this.stdDev,
            fill: this.fill,
            sma: this.sma.dumpState(),
            sd: this.sd.dumpState(),
        };
    }

    restoreState(state: BollingerBandsState): this {
        if (state.period !== this.period) {
            throw new Error(`BollingerBands period mismatch: expected ${this.period}, got ${state.period}`);
        }

        if (state.stdDev !== this.stdDev) {
            throw new Error(`BollingerBands stdDev mismatch: expected ${this.stdDev}, got ${state.stdDev}`);
        }

        this.fill = state.fill;
        this.sma.restoreState(state.sma);
        this.sd.restoreState(state.sd);
        this.bindFilledNextValue();

        return this;
    }

    private bindFilledNextValue(): void {
        delete (this as any).nextValue;
        if (this.fill < this.period) return;

        this.nextValue = (close: number): BollingerBandsValue => {
            const middle = this.sma.nextValue(close);
            const sd = this.sd.nextValue(close, middle);
            const lower = middle - this.stdDev * sd;
            const upper = middle + this.stdDev * sd;

            return { lower, middle, upper };
        };
    }
}
