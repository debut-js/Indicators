import { SMA } from './sma';
import { StandardDeviation } from './providers/standard-deviation';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Historical Volatility (HV)
 *
 *   logReturn = ln(close / prevClose)
 *   HV        = 100 * stdev(logReturn, length) * sqrt(annual / per)
 *
 * `annual` defaults to 365 and `per` to 1, so the result is the
 * annualized standard deviation of daily log returns expressed as a
 * percentage. The first bar contributes no log return; HV emits once
 * `length` valid log returns have been collected.
 */
export class HistoricalVolatility  implements StatefulIndicator<GenericIndicatorState> {
    private prevClose: number | undefined;
    private sma: SMA;
    private stdev: StandardDeviation;
    private multiplier: number;

    constructor(private period = 10, annual = 365, per = 1) {
        this.sma = new SMA(period);
        this.stdev = new StandardDeviation(period);
        this.multiplier = 100 * Math.sqrt(annual / per);
    }

    nextValue(close: number) {
        if (this.prevClose === undefined || this.prevClose === 0) {
            this.prevClose = close;
            return;
        }
        const r = Math.log(close / this.prevClose);
        this.prevClose = close;

        const mean = this.sma.nextValue(r);
        const sd = this.stdev.nextValue(r, mean);
        if (mean === undefined || sd === undefined) return;
        return sd * this.multiplier;
    }

    momentValue(close: number) {
        if (this.prevClose === undefined || this.prevClose === 0) return;
        const r = Math.log(close / this.prevClose);
        const mean = this.sma.momentValue(r);
        if (mean === undefined) return;
        const sd = this.stdev.momentValue(r, mean);
        if (sd === undefined) return;
        return sd * this.multiplier;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
