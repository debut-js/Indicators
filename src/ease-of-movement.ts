import { SMA } from './sma';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Ease of Movement (EOM)
 *
 *   raw = (hl2 - prev_hl2) * (high - low) / (volume / divisor)
 *   EOM = SMA(raw, length)
 *
 * Bars where `volume === 0` produce a non-finite raw value; the SMA
 * skips emitting until the window is fully primed with finite raw
 * inputs. The first bar has no `prev_hl2`, so `raw` is undefined for
 * that bar and the SMA only starts consuming from bar 1.
 */
export class EaseOfMovement  implements StatefulIndicator<GenericIndicatorState> {
    private prevHl2: number | undefined;
    private sma: SMA;

    constructor(private period = 14, private divisor = 10000) {
        this.sma = new SMA(period);
    }

    nextValue(high: number, low: number, volume: number) {
        const hl2 = (high + low) / 2;
        if (this.prevHl2 === undefined) {
            this.prevHl2 = hl2;
            return;
        }
        const change = hl2 - this.prevHl2;
        this.prevHl2 = hl2;

        const denom = volume / this.divisor;
        if (denom === 0 || !isFinite(denom)) return;

        const raw = (change * (high - low)) / denom;
        if (!isFinite(raw)) return;

        return this.sma.nextValue(raw);
    }

    momentValue(high: number, low: number, volume: number) {
        if (this.prevHl2 === undefined) return;
        const hl2 = (high + low) / 2;
        const change = hl2 - this.prevHl2;
        const denom = volume / this.divisor;
        if (denom === 0 || !isFinite(denom)) return;
        const raw = (change * (high - low)) / denom;
        if (!isFinite(raw)) return;
        return this.sma.momentValue(raw);
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
