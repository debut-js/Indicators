import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 In stock and securities market technical analysis, parabolic SAR (parabolic stop and reverse)
 is a method devised by J. Welles Wilder, Jr., to find potential reversals in the market price
 direction of traded goods such as securities or currency exchanges such as forex It is a
 trend-following (lagging) indicator and may be used to set a trailing stop loss or determine
 entry or exit points based on prices tending to stay within a parabolic curve during a strong trend.

 Similar to option theory's concept of time decay, the concept draws on the idea that "time is the enemy".
 Thus, unless a security can continue to generate more profits over time, it should be liquidated.
 The indicator generally works only in trending markets, and creates "whipsaws" during ranging or,
 sideways phases. Therefore, Wilder recommends first establishing the direction or change in direction
 of the trend through the use of parabolic SAR, and then using a different indicator such as the
 Average Directional Index to determine the strength of the trend.

 A parabola below the price is generally bullish, while a parabola above is generally bearish.
 A parabola below the price may be used as support, whereas a parabola above the price may represent resistance.
 * */

export class PSAR  implements StatefulIndicator<GenericIndicatorState> {
    private start: number;
    private acceleration: number;
    private max: number;
    private psar: number;
    private isBullTrend: boolean;
    private result: number;
    private low1: number;
    private high1: number;
    private low2: number;
    private high2: number;
    private accelerationFactor: number;
    private lowest: number;
    private highest: number;

    constructor(start = 0.02, acceleration = 0.02, max = 0.2) {
        this.start = start;
        this.acceleration = acceleration;
        this.max = max;
        this.result = 0;
        this.isBullTrend = true;
    }

    nextValue(high: number, low: number, close: number) {
        if (!this.result) {
            this.result = close;
            this.low1 = low;
            this.high1 = high;
            this.low2 = low;
            this.high2 = high;
            this.highest = high;
            this.lowest = low;
            this.accelerationFactor = this.start;

            return low;
        }

        if (this.isBullTrend) {
            this.psar = this.result + this.accelerationFactor * (this.highest - this.result);
        } else {
            this.psar = this.result + this.accelerationFactor * (this.lowest - this.result);
        }

        if (this.isBullTrend) {
            if (low < this.psar) {
                this.isBullTrend = false;
                this.psar = this.highest;
                this.lowest = low;
                this.accelerationFactor = this.start;
            } else {
                if (high > this.highest) {
                    this.highest = high;

                    const sumOfAcceleration = this.accelerationFactor + this.acceleration;
                    this.accelerationFactor = sumOfAcceleration > this.max ? this.max : sumOfAcceleration;
                }
                if (this.low1 < this.psar) {
                    this.psar = this.low1;
                }
                if (this.low2 < this.psar) {
                    this.psar = this.low2;
                }
            }
        } else {
            if (high > this.psar) {
                this.isBullTrend = true;
                this.psar = this.lowest;
                this.highest = high;
                this.accelerationFactor = this.start;
            } else {
                if (low < this.lowest) {
                    this.lowest = low;

                    const sumOfAcceleration = this.accelerationFactor + this.acceleration;
                    this.accelerationFactor = sumOfAcceleration > this.max ? this.max : sumOfAcceleration;
                }
                if (this.high1 > this.psar) {
                    this.psar = this.high1;
                }
                if (this.high2 > this.psar) {
                    this.psar = this.high2;
                }
            }
        }

        this.low2 = this.low1;
        this.low1 = low;
        this.high2 = this.high1;
        this.high1 = high;
        this.result = this.psar;

        return this.result;
    }

    momentValue(high: number, low: number) {
        if (!this.result) {
            return low;
        }

        let isBullTrend = this.isBullTrend;
        let result = this.result;
        let low1 = this.low1;
        let high1 = this.high1;
        let low2 = this.low2;
        let high2 = this.high2;
        let highest = this.highest;
        let lowest = this.lowest;
        let accelerationFactor = this.accelerationFactor;

        let psar;

        if (isBullTrend) {
            psar = result + accelerationFactor * (highest - result);
        } else {
            psar = result + accelerationFactor * (lowest - result);
        }

        if (isBullTrend) {
            if (low < psar) {
                psar = highest;
            } else {
                if (low1 < psar) {
                    psar = low1;
                }
                if (low2 < psar) {
                    psar = low2;
                }
            }
        } else {
            if (high > psar) {
                psar = lowest;
            } else {
                if (high1 > psar) {
                    psar = high1;
                }
                if (high2 > psar) {
                    psar = high2;
                }
            }
        }

        return psar;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
