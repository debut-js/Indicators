import { PercentRank } from './providers/percent-rank';
import { ROC } from './roc';
import { RSI } from './rsi';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Connors RSI (CRSI) uses the above formula to generate a value between 0 and 100.
 * This is primarily used to identify overbought and oversold levels.
 * Connor's original definition of these levels is that a value over 90
 * should be considered overbought and a value under 10 should be considered oversold.
 * On occasion, signals occur during slight corrections during a trend. For example,
 * when the market is in an uptrend, Connors RSI might generate short term sell signals.
 * When the market is in a downtrend, Connors RSI might generate short term buy signals.
 * Original core here: https://tradingview.com/script/vWAPUAl9-Stochastic-Connors-RSI/
 */
export class cRSI  implements StatefulIndicator<GenericIndicatorState> {
    private rsi: RSI;
    private updownRsi: RSI;
    private prevClose: number;
    private updownPeriod: number;
    private updownValue: number;
    private roc: ROC;
    private percentRank: PercentRank;

    constructor(private period = 3, updownRsiPeriod = 2, percentRankPeriod = 100) {
        this.rsi = new RSI(this.period);
        this.updownRsi = new RSI(updownRsiPeriod);
        this.roc = new ROC(1);
        this.percentRank = new PercentRank(percentRankPeriod);
        this.updownPeriod = 0;
        this.prevClose = 0;
    }

    nextValue(value: number) {
        const rsi = this.rsi.nextValue(value);
        const percentRank = this.percentRank.nextValue(this.roc.nextValue(value));

        this.updownPeriod = this.getUpdownPeriod(value);
        this.prevClose = value;
        this.updownValue = this.updownRsi.nextValue(this.updownPeriod);

        if (!this.updownValue) {
            return;
        }

        return (rsi + this.updownValue + percentRank) / 3;
    }

    momentValue(value: number) {
        const rsi = this.rsi.momentValue(value);
        const percentRank = this.percentRank.momentValue(this.roc.momentValue(value));
        const updownPeriod = this.getUpdownPeriod(value);
        const updownValue = this.updownRsi.momentValue(updownPeriod);

        if (updownValue === undefined) {
            return;
        }

        return (rsi + updownValue + percentRank) / 3;
    }

    private getUpdownPeriod(value: number) {
        let updownPeriod = this.updownPeriod;

        if (value > this.prevClose) {
            // reset negative streak
            if (this.updownPeriod < 0) {
                updownPeriod = 0;
            }

            updownPeriod++;
        } else if (value < this.prevClose) {
            // reset positive streak
            if (this.updownPeriod > 0) {
                updownPeriod = 0;
            }

            updownPeriod--;
        } else {
            updownPeriod = 0;
        }

        return updownPeriod;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
