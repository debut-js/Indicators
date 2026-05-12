import { CircularBuffer } from './providers/circular-buffer';

import { GenericIndicatorState, StatefulIndicator, dumpObjectState, restoreObjectState } from './stateful-indicator';
/**
 * Chaikin Money Flow (CMF)
 *
 *   mfm = ((close - low) - (high - close)) / (high - low)             // 0 on doji
 *   mfv = mfm * volume
 *   CMF = sum(mfv, length) / sum(volume, length)
 *
 * Emits from bar `length-1` onwards. Returns 0 for a window with no
 * volume (matching the oakscriptjs reference's safeguard).
 */
export class ChaikinMF  implements StatefulIndicator<GenericIndicatorState> {
    private adBuf: CircularBuffer;
    private volBuf: CircularBuffer;
    private sumAd = 0;
    private sumVol = 0;

    constructor(private period = 20) {
        this.adBuf = new CircularBuffer(period);
        this.volBuf = new CircularBuffer(period);
    }

    nextValue(high: number, low: number, close: number, volume: number) {
        let ad = 0;
        if (!((close === high && close === low) || high === low)) {
            ad = ((2 * close - low - high) / (high - low)) * volume;
        }

        const wasFilled = this.adBuf.filled;
        const oldAd = this.adBuf.push(ad);
        const oldVol = this.volBuf.push(volume);

        if (wasFilled) {
            this.sumAd += ad - oldAd;
            this.sumVol += volume - oldVol;
        } else {
            this.sumAd += ad;
            this.sumVol += volume;
        }

        if (!this.adBuf.filled) return;
        if (this.sumVol === 0) return 0;
        return this.sumAd / this.sumVol;
    }

    momentValue(high: number, low: number, close: number, volume: number) {
        let ad = 0;
        if (!((close === high && close === low) || high === low)) {
            ad = ((2 * close - low - high) / (high - low)) * volume;
        }

        let sumAd: number;
        let sumVol: number;
        if (this.adBuf.filled) {
            sumAd = this.sumAd - this.adBuf.peek() + ad;
            sumVol = this.sumVol - this.volBuf.peek() + volume;
        } else if (this.adBuf.loaded === this.period - 1) {
            sumAd = this.sumAd + ad;
            sumVol = this.sumVol + volume;
        } else {
            return;
        }

        if (sumVol === 0) return 0;
        return sumAd / sumVol;
    }


    dumpState(): GenericIndicatorState {
        return dumpObjectState(this);
    }

    restoreState(state: GenericIndicatorState): this {
        return restoreObjectState(this, state);
    }
}
