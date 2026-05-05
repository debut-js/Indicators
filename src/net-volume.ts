/**
 * Net Volume
 *
 *   netVolume = close > open ?  +volume
 *             : close < open ?  -volume
 *             :                  0
 *
 * Pure per-bar computation; no state. Used as a simple bullish/bearish
 * volume bias.
 */
export class NetVolume {
    nextValue(open: number, close: number, volume: number) {
        if (close > open) return volume;
        if (close < open) return -volume;
        return 0;
    }

    momentValue(open: number, close: number, volume: number) {
        return this.nextValue(open, close, volume);
    }
}
