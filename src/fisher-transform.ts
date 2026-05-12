import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Fisher Transform
 *
 *   raw     = 2 * ((hl2 - lowestHl2) / (highestHl2 - lowestHl2)) - 1   (clamped)
 *   value   = 0.66 * raw + 0.67 * prevValue                            (clamped to ±0.999)
 *   fisher  = 0.5 * ln((1 + value) / (1 - value)) + 0.5 * prevFisher
 *   trigger = prevFisher
 *
 * The Fisher line is emitted from bar `length-1`; the trigger from bar
 * `length` (one bar later, since it's a one-bar lag of Fisher).
 */
export class FisherTransform  implements StatefulIndicator<GenericIndicatorState> {
    private highs: CircularBuffer;
    private lows: CircularBuffer;
    private value = 0;
    private fish = 0;
    private prevFish = 0;
    private barCount = 0;
    private firstFishEmitted = false;

    constructor(private period = 9) {
        this.highs = new CircularBuffer(period);
        this.lows = new CircularBuffer(period);
    }

    nextValue(high: number, low: number) {
        this.highs.push(high);
        this.lows.push(low);
        this.barCount++;

        const hl2 = (high + low) / 2;

        let highestHl2 = -Infinity;
        let lowestHl2 = Infinity;
        // forEach is only safe when filled; otherwise walk the loaded
        // prefix manually via at().
        if (this.highs.filled) {
            this.highs.forEach((h, idx) => {
                const l = this.lows.at(idx as number) as number;
                const m = (h + l) / 2;
                if (m > highestHl2) highestHl2 = m;
                if (m < lowestHl2) lowestHl2 = m;
            });
        } else {
            for (let i = 0; i < this.highs.loaded; i++) {
                const h = this.highs.at(i) as number;
                const l = this.lows.at(i) as number;
                const m = (h + l) / 2;
                if (m > highestHl2) highestHl2 = m;
                if (m < lowestHl2) lowestHl2 = m;
            }
        }

        const range = highestHl2 - lowestHl2;
        const normalized = range !== 0 ? (hl2 - lowestHl2) / range - 0.5 : 0;
        let nextValueState = 0.66 * normalized + 0.67 * this.value;
        if (nextValueState > 0.99) nextValueState = 0.999;
        else if (nextValueState < -0.99) nextValueState = -0.999;
        this.value = nextValueState;

        this.prevFish = this.fish;
        this.fish = 0.5 * Math.log((1 + this.value) / (1 - this.value)) + 0.5 * this.prevFish;

        // Emit Fisher only after `period` bars have been observed; the
        // trigger is one bar of lag behind that.
        const fisher = this.barCount >= this.period ? this.fish : undefined;
        const trigger = this.firstFishEmitted ? this.prevFish : undefined;
        if (fisher !== undefined) this.firstFishEmitted = true;
        return { fisher, trigger };
    }

    momentValue(high: number, low: number) {
        // Hypothetical scan: include current high/low in min/max but
        // don't update internal state.
        const hl2 = (high + low) / 2;
        let highestHl2 = hl2;
        let lowestHl2 = hl2;

        // Skip oldest if buffer would evict (filled), else include all.
        const startOffset = this.highs.filled ? 1 : 0;
        for (let i = startOffset; i < this.highs.loaded; i++) {
            const h = this.highs.at(i) as number;
            const l = this.lows.at(i) as number;
            const m = (h + l) / 2;
            if (m > highestHl2) highestHl2 = m;
            if (m < lowestHl2) lowestHl2 = m;
        }

        const range = highestHl2 - lowestHl2;
        const normalized = range !== 0 ? (hl2 - lowestHl2) / range - 0.5 : 0;
        let v = 0.66 * normalized + 0.67 * this.value;
        if (v > 0.99) v = 0.999;
        else if (v < -0.99) v = -0.999;
        const fish = 0.5 * Math.log((1 + v) / (1 - v)) + 0.5 * this.fish;
        const fisher = this.barCount + 1 >= this.period ? fish : undefined;
        const trigger = this.firstFishEmitted ? this.fish : undefined;
        return { fisher, trigger };
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
