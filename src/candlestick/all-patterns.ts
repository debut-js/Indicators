import { SMA } from '../sma';
import {
    BarFields,
    BodyAvgEMA,
    TREND_PERIOD,
    derive,
    hasDnShadow,
    hasUpShadow,
} from './helpers';

/** Pattern name reported by `AllCandlestickPatterns.nextValue`. */
export type CandlestickPatternName =
    | 'Doji'
    | 'DragonflyDoji'
    | 'GravestoneDoji'
    | 'Hammer'
    | 'HangingMan'
    | 'InvertedHammer'
    | 'ShootingStar'
    | 'LongLowerShadow'
    | 'LongUpperShadow'
    | 'MarubozuBlack'
    | 'MarubozuWhite'
    | 'SpinningTopBlack'
    | 'SpinningTopWhite'
    | 'DarkCloudCover'
    | 'DojiStarBearish'
    | 'DojiStarBullish'
    | 'EngulfingBearish'
    | 'EngulfingBullish'
    | 'FallingWindow'
    | 'RisingWindow'
    | 'HaramiBearish'
    | 'HaramiBullish'
    | 'HaramiCrossBearish'
    | 'HaramiCrossBullish'
    | 'KickingBearish'
    | 'KickingBullish'
    | 'OnNeck'
    | 'Piercing'
    | 'TweezerBottom'
    | 'TweezerTop'
    | 'AbandonedBabyBearish'
    | 'AbandonedBabyBullish'
    | 'DownsideTasukiGap'
    | 'UpsideTasukiGap'
    | 'EveningStar'
    | 'EveningDojiStar'
    | 'MorningStar'
    | 'MorningDojiStar'
    | 'ThreeBlackCrows'
    | 'ThreeWhiteSoldiers'
    | 'TriStarBearish'
    | 'TriStarBullish'
    | 'FallingThreeMethods'
    | 'RisingThreeMethods';

/** Frame stored in the rolling 5-bar window — has every field every
 *  pattern's predicate could read. */
interface Frame extends BarFields {
    bodyAvg: number;
    smallBody: boolean;
    longBody: boolean;
    hasUpShadow: boolean;
    hasDnShadow: boolean;
    upTrend: boolean;
    downTrend: boolean;
}

function isMarubozu(longBody: boolean, body: number, upShadow: number, dnShadow: number): boolean {
    return longBody && upShadow <= (5 / 100) * body && dnShadow <= (5 / 100) * body;
}

/**
 * "All 44 candlestick patterns at once" detector.
 *
 * This class is intentionally **self-contained** and does **not**
 * delegate to the individual pattern classes in `./patterns.ts`. It
 * maintains its own EMA(14) of body, its own SMA(50) of close, and
 * its own 5-bar frame window — then runs all 44 predicates inline
 * against the current `cur` / `p1..p4` slots.
 *
 * Use this when you want to scan a bar stream for the entire pattern
 * library at once. For one-off detection of a single pattern, the
 * standalone class (e.g. `new Doji()`) is more efficient because it
 * skips the heavy bits its predicate doesn't read.
 */
export class AllCandlestickPatterns {
    private bodyAvg = new BodyAvgEMA();
    private sma50 = new SMA(TREND_PERIOD);
    private p1: Frame | undefined;
    private p2: Frame | undefined;
    private p3: Frame | undefined;
    private p4: Frame | undefined;

    nextValue(o: number, h: number, l: number, c: number): CandlestickPatternName[] {
        const cur = this.buildFrame(o, h, l, c, /*moment*/ false);
        const fired = this.scan(cur, this.p1, this.p2, this.p3, this.p4);
        // Rotate the window: cur becomes p1, drop p4.
        this.p4 = this.p3;
        this.p3 = this.p2;
        this.p2 = this.p1;
        this.p1 = cur;
        return fired;
    }

    momentValue(o: number, h: number, l: number, c: number): CandlestickPatternName[] {
        const cur = this.buildFrame(o, h, l, c, /*moment*/ true);
        // Hypothetical: don't rotate the window. Predicates see
        // (cur, p1, p2, p3, p4) just like a real bar would, but
        // committed state stays untouched.
        return this.scan(cur, this.p1, this.p2, this.p3, this.p4);
    }

    private buildFrame(o: number, h: number, l: number, c: number, isMoment: boolean): Frame {
        const f = derive(o, h, l, c);
        const ba = isMoment ? this.bodyAvg.momentValue(f.body) : this.bodyAvg.nextValue(f.body);
        const sma = isMoment ? this.sma50.momentValue(c) : this.sma50.nextValue(c);
        const upTrend = sma !== undefined && c > sma;
        const downTrend = sma !== undefined && c < sma;
        return {
            ...f,
            bodyAvg: ba,
            smallBody: f.body < ba,
            longBody: f.body > ba,
            hasUpShadow: hasUpShadow(f.body, f.upShadow),
            hasDnShadow: hasDnShadow(f.body, f.dnShadow),
            upTrend,
            downTrend,
        };
    }

    private scan(
        cur: Frame,
        p1: Frame | undefined,
        p2: Frame | undefined,
        p3: Frame | undefined,
        p4: Frame | undefined,
    ): CandlestickPatternName[] {
        const fired: CandlestickPatternName[] = [];

        // -------- single-bar (always evaluable) --------
        if (
            cur.doji &&
            !(cur.isDojiBody && cur.upShadow <= cur.body) &&
            !(cur.isDojiBody && cur.dnShadow <= cur.body)
        ) {
            fired.push('Doji');
        }
        if (cur.isDojiBody && cur.upShadow <= cur.body) fired.push('DragonflyDoji');
        if (cur.isDojiBody && cur.dnShadow <= cur.body) fired.push('GravestoneDoji');
        if (cur.dnShadow > (cur.range / 100) * 75) fired.push('LongLowerShadow');
        if (cur.upShadow > (cur.range / 100) * 75) fired.push('LongUpperShadow');
        if (
            cur.dnShadow >= (cur.range / 100) * 34 &&
            cur.upShadow >= (cur.range / 100) * 34 &&
            !cur.isDojiBody &&
            cur.blackBody
        ) fired.push('SpinningTopBlack');
        if (
            cur.dnShadow >= (cur.range / 100) * 34 &&
            cur.upShadow >= (cur.range / 100) * 34 &&
            !cur.isDojiBody &&
            cur.whiteBody
        ) fired.push('SpinningTopWhite');
        if (
            cur.blackBody &&
            cur.longBody &&
            cur.upShadow <= (5 / 100) * cur.body &&
            cur.dnShadow <= (5 / 100) * cur.body
        ) fired.push('MarubozuBlack');
        if (
            cur.whiteBody &&
            cur.longBody &&
            cur.upShadow <= (5 / 100) * cur.body &&
            cur.dnShadow <= (5 / 100) * cur.body
        ) fired.push('MarubozuWhite');

        // The trend-filtered single-bar patterns require sma50 to be
        // valid — encoded by `cur.upTrend || cur.downTrend` being a
        // possible truthy result, which is only reachable post-warmup.
        if (
            cur.smallBody && cur.body > 0 && cur.bodyLo > cur.hl2 &&
            cur.dnShadow >= 2 * cur.body && !cur.hasUpShadow && cur.downTrend
        ) fired.push('Hammer');
        if (
            cur.smallBody && cur.body > 0 && cur.bodyLo > cur.hl2 &&
            cur.dnShadow >= 2 * cur.body && !cur.hasUpShadow && cur.upTrend
        ) fired.push('HangingMan');
        if (
            cur.smallBody && cur.body > 0 && cur.bodyHi < cur.hl2 &&
            cur.upShadow >= 2 * cur.body && !cur.hasDnShadow && cur.downTrend
        ) fired.push('InvertedHammer');
        if (
            cur.smallBody && cur.body > 0 && cur.bodyHi < cur.hl2 &&
            cur.upShadow >= 2 * cur.body && !cur.hasDnShadow && cur.upTrend
        ) fired.push('ShootingStar');

        // -------- two-bar --------
        if (p1) {
            if (
                p1.upTrend && p1.whiteBody && p1.longBody && cur.blackBody &&
                cur.open >= p1.high && cur.close < p1.bodyMiddle && cur.close > p1.open
            ) fired.push('DarkCloudCover');
            if (
                cur.upTrend && p1.whiteBody && p1.longBody && cur.isDojiBody && cur.bodyLo > p1.bodyHi
            ) fired.push('DojiStarBearish');
            if (
                cur.downTrend && p1.blackBody && p1.longBody && cur.isDojiBody && cur.bodyHi < p1.bodyLo
            ) fired.push('DojiStarBullish');
            if (
                cur.upTrend && cur.blackBody && cur.longBody &&
                p1.whiteBody && p1.smallBody &&
                cur.close <= p1.open && cur.open >= p1.close &&
                (cur.close < p1.open || cur.open > p1.close)
            ) fired.push('EngulfingBearish');
            if (
                cur.downTrend && cur.whiteBody && cur.longBody &&
                p1.blackBody && p1.smallBody &&
                cur.close >= p1.open && cur.open <= p1.close &&
                (cur.close > p1.open || cur.open < p1.close)
            ) fired.push('EngulfingBullish');
            if (p1.downTrend && cur.range !== 0 && p1.range !== 0 && cur.high < p1.low) {
                fired.push('FallingWindow');
            }
            if (p1.upTrend && cur.range !== 0 && p1.range !== 0 && cur.low > p1.high) {
                fired.push('RisingWindow');
            }
            if (
                p1.longBody && p1.whiteBody && p1.upTrend &&
                cur.blackBody && cur.smallBody &&
                cur.high <= p1.bodyHi && cur.low >= p1.bodyLo
            ) fired.push('HaramiBearish');
            if (
                p1.longBody && p1.blackBody && p1.downTrend &&
                cur.whiteBody && cur.smallBody &&
                cur.high <= p1.bodyHi && cur.low >= p1.bodyLo
            ) fired.push('HaramiBullish');
            if (
                p1.longBody && p1.whiteBody && p1.upTrend &&
                cur.isDojiBody && cur.high <= p1.bodyHi && cur.low >= p1.bodyLo
            ) fired.push('HaramiCrossBearish');
            if (
                p1.longBody && p1.blackBody && p1.downTrend &&
                cur.isDojiBody && cur.high <= p1.bodyHi && cur.low >= p1.bodyLo
            ) fired.push('HaramiCrossBullish');
            if (
                isMarubozu(p1.longBody, p1.body, p1.upShadow, p1.dnShadow) && p1.whiteBody &&
                isMarubozu(cur.longBody, cur.body, cur.upShadow, cur.dnShadow) && cur.blackBody &&
                p1.low > cur.high
            ) fired.push('KickingBearish');
            if (
                isMarubozu(p1.longBody, p1.body, p1.upShadow, p1.dnShadow) && p1.blackBody &&
                isMarubozu(cur.longBody, cur.body, cur.upShadow, cur.dnShadow) && cur.whiteBody &&
                p1.high < cur.low
            ) fired.push('KickingBullish');
            if (
                cur.downTrend && p1.blackBody && p1.longBody &&
                cur.whiteBody && cur.open < p1.close && cur.smallBody &&
                cur.range !== 0 && Math.abs(cur.close - p1.low) <= cur.bodyAvg * 0.05
            ) fired.push('OnNeck');
            if (
                p1.downTrend && p1.blackBody && p1.longBody &&
                cur.whiteBody && cur.open <= p1.low &&
                cur.close > p1.bodyMiddle && cur.close < p1.open
            ) fired.push('Piercing');
            if (
                p1.downTrend &&
                (!cur.isDojiBody || (cur.hasUpShadow && cur.hasDnShadow)) &&
                Math.abs(cur.low - p1.low) <= cur.bodyAvg * 0.05 &&
                p1.blackBody && cur.whiteBody && p1.longBody
            ) fired.push('TweezerBottom');
            if (
                p1.upTrend &&
                (!cur.isDojiBody || (cur.hasUpShadow && cur.hasDnShadow)) &&
                Math.abs(cur.high - p1.high) <= cur.bodyAvg * 0.05 &&
                p1.whiteBody && cur.blackBody && p1.longBody
            ) fired.push('TweezerTop');
        }

        // -------- three-bar --------
        if (p1 && p2) {
            if (
                p2.upTrend && p2.whiteBody && p1.isDojiBody &&
                p2.high < p1.low && cur.blackBody && p1.low > cur.high
            ) fired.push('AbandonedBabyBearish');
            if (
                p2.downTrend && p2.blackBody && p1.isDojiBody &&
                p2.low > p1.high && cur.whiteBody && p1.high < cur.low
            ) fired.push('AbandonedBabyBullish');
            if (
                p2.longBody && p1.smallBody && cur.downTrend &&
                p2.blackBody && p1.bodyHi < p2.bodyLo && p1.blackBody && cur.whiteBody &&
                cur.bodyHi <= p2.bodyLo && cur.bodyHi >= p1.bodyHi
            ) fired.push('DownsideTasukiGap');
            if (
                p2.longBody && p1.smallBody && cur.upTrend &&
                p2.whiteBody && p1.bodyLo > p2.bodyHi && p1.whiteBody && cur.blackBody &&
                cur.bodyLo >= p2.bodyHi && cur.bodyLo <= p1.bodyLo
            ) fired.push('UpsideTasukiGap');
            if (
                p2.longBody && p1.smallBody && cur.longBody && cur.upTrend &&
                p2.whiteBody && p1.bodyLo > p2.bodyHi && cur.blackBody &&
                cur.bodyLo <= p2.bodyMiddle && cur.bodyLo > p2.bodyLo && p1.bodyLo > cur.bodyHi
            ) fired.push('EveningStar');
            if (
                p2.longBody && p1.isDojiBody && cur.longBody && cur.upTrend &&
                p2.whiteBody && p1.bodyLo > p2.bodyHi && cur.blackBody &&
                cur.bodyLo <= p2.bodyMiddle && cur.bodyLo > p2.bodyLo && p1.bodyLo > cur.bodyHi
            ) fired.push('EveningDojiStar');
            if (
                p2.longBody && p1.smallBody && cur.longBody && cur.downTrend &&
                p2.blackBody && p1.bodyHi < p2.bodyLo && cur.whiteBody &&
                cur.bodyHi >= p2.bodyMiddle && cur.bodyHi < p2.bodyHi && p1.bodyHi < cur.bodyLo
            ) fired.push('MorningStar');
            if (
                p2.longBody && p1.isDojiBody && cur.longBody && cur.downTrend &&
                p2.blackBody && p1.bodyHi < p2.bodyLo && cur.whiteBody &&
                cur.bodyHi >= p2.bodyMiddle && cur.bodyHi < p2.bodyHi && p1.bodyHi < cur.bodyLo
            ) fired.push('MorningDojiStar');

            const noDn = (f: Frame) => (f.range * 5) / 100 > f.dnShadow;
            if (
                cur.longBody && p1.longBody && p2.longBody &&
                cur.blackBody && p1.blackBody && p2.blackBody &&
                cur.close < p1.close && p1.close < p2.close &&
                cur.open > p1.close && cur.open < p1.open &&
                p1.open > p2.close && p1.open < p2.open &&
                noDn(cur) && noDn(p1) && noDn(p2)
            ) fired.push('ThreeBlackCrows');

            const noUp = (f: Frame) => (f.range * 5) / 100 > f.upShadow;
            if (
                cur.longBody && p1.longBody && p2.longBody &&
                cur.whiteBody && p1.whiteBody && p2.whiteBody &&
                cur.close > p1.close && p1.close > p2.close &&
                cur.open < p1.close && cur.open > p1.open &&
                p1.open < p2.close && p1.open > p2.open &&
                noUp(cur) && noUp(p1) && noUp(p2)
            ) fired.push('ThreeWhiteSoldiers');

            if (
                p2.doji && p1.doji && cur.doji && p2.upTrend &&
                p2.bodyHi < p1.bodyLo && p1.bodyLo > cur.bodyHi
            ) fired.push('TriStarBearish');
            if (
                p2.doji && p1.doji && cur.doji && p2.downTrend &&
                p2.bodyLo > p1.bodyHi && p1.bodyHi < cur.bodyLo
            ) fired.push('TriStarBullish');
        }

        // -------- five-bar --------
        if (p1 && p2 && p3 && p4) {
            if (
                p4.downTrend && p4.longBody && p4.blackBody &&
                p3.smallBody && p3.whiteBody && p3.open > p4.low && p3.close < p4.high &&
                p2.smallBody && p2.whiteBody && p2.open > p4.low && p2.close < p4.high &&
                p1.smallBody && p1.whiteBody && p1.open > p4.low && p1.close < p4.high &&
                cur.longBody && cur.blackBody && cur.close < p4.close
            ) fired.push('FallingThreeMethods');
            if (
                p4.upTrend && p4.longBody && p4.whiteBody &&
                p3.smallBody && p3.blackBody && p3.open < p4.high && p3.close > p4.low &&
                p2.smallBody && p2.blackBody && p2.open < p4.high && p2.close > p4.low &&
                p1.smallBody && p1.blackBody && p1.open < p4.high && p1.close > p4.low &&
                cur.longBody && cur.whiteBody && cur.close > p4.close
            ) fired.push('RisingThreeMethods');
        }

        return fired;
    }
}
