import { percentChange } from './utils';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
export type WaveData = {
    consolidate: number;
    power: number;
    streak: number;
    diff: number;
    startPrice: number;
    prevPeak: number;
};

function clenWave(wave: WaveData) {
    wave.consolidate = 0;
    wave.power = 0;
    wave.streak = 0;
    wave.diff = 0;
    wave.startPrice = 0;
    wave.prevPeak = 0;

    return wave;
}

export class Wave  implements StatefulIndicator<GenericIndicatorState> {
    private up: WaveData;
    private down: WaveData;

    /**
     * Конструктор
     */
    constructor() {
        this.up = { consolidate: 0, power: 0, streak: 0, startPrice: 0, diff: 0, prevPeak: 0 };
        this.down = { consolidate: 0, power: 0, streak: 0, startPrice: 0, diff: 0, prevPeak: 0 };
    }

    nextValue(open: number, close: number, high: number, low: number) {
        // bullish
        if (open < close || (this.up.streak && this.up.prevPeak < low)) {
            if (!this.up.startPrice) {
                this.up.startPrice = open;
            }

            if (this.down.streak) {
                clenWave(this.down);
            }

            const diff = close - open;
            this.up.streak++;
            this.up.prevPeak = low;

            if (this.up.diff > diff) {
                this.up.consolidate++;
            } else {
                this.up.consolidate = 0;
            }

            this.up.diff = diff;
            this.up.power = percentChange(close, this.up.startPrice);
        }

        // bearish
        if (open > close || (this.down.streak && this.down.prevPeak > high)) {
            if (!this.down.startPrice) {
                this.down.startPrice = open;
            }

            if (this.up.streak) {
                clenWave(this.up);
            }

            const diff = open - close;
            this.down.streak++;
            this.down.prevPeak = high;

            if (this.down.diff > diff) {
                this.down.consolidate++;
            } else {
                this.down.consolidate = 0;
            }

            this.down.diff = diff;
            this.down.power = percentChange(close, this.down.startPrice);
        }

        // doji is neutral
        if (open === close) {
            this.up.streak++;
            this.down.streak++;
            this.up.diff = this.down.diff = 0;
        }

        if (this.up.streak > this.down.streak) {
            return { ...this.up };
        } else {
            return { ...this.down };
        }
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
