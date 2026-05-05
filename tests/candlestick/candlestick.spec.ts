import * as debut from '../../src/candlestick';
import { BasePattern } from '../../src/candlestick/patterns';
import * as ti from 'technicalindicators';
import { genBars } from '../lwc-fixtures';

/**
 * Cross-SDK tests against the `technicalindicators` reference. For
 * each pattern we walk synthetic OHLCV bars through both libraries
 * and assert they fire on the same bars.
 *
 * `technicalindicators` exposes a `hasPattern({open, high, low, close})`
 * shape that takes parallel arrays of length `requiredCount`. We feed
 * it the same trailing window the streaming debut pattern reads
 * internally.
 */

interface Pair {
    name: string;
    required: number;
    debut: { nextValue: (o: number, h: number, l: number, c: number) => boolean | undefined };
    ti: (data: { open: number[]; high: number[]; low: number[]; close: number[] }) => boolean;
}

function buildPairs(): Pair[] {
    return [
        // Single-bar (required=1)
        { name: 'Doji', required: 1, debut: new debut.Doji(), ti: ti.doji },
        { name: 'DragonFlyDoji', required: 1, debut: new debut.DragonFlyDoji(), ti: ti.dragonflydoji },
        { name: 'GraveStoneDoji', required: 1, debut: new debut.GraveStoneDoji(), ti: ti.gravestonedoji },
        { name: 'BearishHammerStick', required: 1, debut: new debut.BearishHammerStick(), ti: ti.bearishhammerstick },
        { name: 'BullishHammerStick', required: 1, debut: new debut.BullishHammerStick(), ti: ti.bullishhammerstick },
        { name: 'BearishInvertedHammerStick', required: 1, debut: new debut.BearishInvertedHammerStick(), ti: ti.bearishinvertedhammerstick },
        { name: 'BullishInvertedHammerStick', required: 1, debut: new debut.BullishInvertedHammerStick(), ti: ti.bullishinvertedhammerstick },
        { name: 'BearishMarubozu', required: 1, debut: new debut.BearishMarubozu(), ti: ti.bearishmarubozu },
        { name: 'BullishMarubozu', required: 1, debut: new debut.BullishMarubozu(), ti: ti.bullishmarubozu },
        { name: 'BearishSpinningTop', required: 1, debut: new debut.BearishSpinningTop(), ti: ti.bearishspinningtop },
        { name: 'BullishSpinningTop', required: 1, debut: new debut.BullishSpinningTop(), ti: ti.bullishspinningtop },

        // Two-bar (required=2)
        { name: 'BearishEngulfingPattern', required: 2, debut: new debut.BearishEngulfingPattern(), ti: ti.bearishengulfingpattern },
        { name: 'BullishEngulfingPattern', required: 2, debut: new debut.BullishEngulfingPattern(), ti: ti.bullishengulfingpattern },
        { name: 'BearishHarami', required: 2, debut: new debut.BearishHarami(), ti: ti.bearishharami },
        { name: 'BullishHarami', required: 2, debut: new debut.BullishHarami(), ti: ti.bullishharami },
        { name: 'BearishHaramiCross', required: 2, debut: new debut.BearishHaramiCross(), ti: ti.bearishharamicross },
        { name: 'BullishHaramiCross', required: 2, debut: new debut.BullishHaramiCross(), ti: ti.bullishharamicross },
        { name: 'DarkCloudCover', required: 2, debut: new debut.DarkCloudCover(), ti: ti.darkcloudcover },
        { name: 'PiercingLine', required: 2, debut: new debut.PiercingLine(), ti: ti.piercingline },

        // Three-bar (required=3)
        { name: 'AbandonedBaby', required: 3, debut: new debut.AbandonedBaby(), ti: ti.abandonedbaby },
        { name: 'DownsideTasukiGap', required: 3, debut: new debut.DownsideTasukiGap(), ti: ti.downsidetasukigap },
        { name: 'EveningStar', required: 3, debut: new debut.EveningStar(), ti: ti.eveningstar },
        { name: 'EveningDojiStar', required: 3, debut: new debut.EveningDojiStar(), ti: ti.eveningdojistar },
        { name: 'MorningStar', required: 3, debut: new debut.MorningStar(), ti: ti.morningstar },
        { name: 'MorningDojiStar', required: 3, debut: new debut.MorningDojiStar(), ti: ti.morningdojistar },
        { name: 'ThreeBlackCrows', required: 3, debut: new debut.ThreeBlackCrows(), ti: ti.threeblackcrows },
        { name: 'ThreeWhiteSoldiers', required: 3, debut: new debut.ThreeWhiteSoldiers(), ti: ti.threewhitesoldiers },

        // Five-bar (required=5)
        { name: 'HammerPattern', required: 5, debut: new debut.HammerPattern(), ti: ti.hammerpattern },
        { name: 'HammerPatternUnconfirmed', required: 5, debut: new debut.HammerPatternUnconfirmed(), ti: ti.hammerpatternunconfirmed },
        { name: 'TweezerBottom', required: 5, debut: new debut.TweezerBottom(), ti: ti.tweezerbottom },
        { name: 'TweezerTop', required: 5, debut: new debut.TweezerTop(), ti: ti.tweezertop },
    ];
}

describe('Candlestick patterns vs technicalindicators', () => {
    const bars = genBars(600, 101);

    beforeEach(() => {
        // Reset the singleton between cases so prior state doesn't
        // leak into the next pattern's run.
        BasePattern.reset();
    });

    it.each(buildPairs())('$name fires on the same bars as technicalindicators', ({ name, required, debut: pattern, ti: tiPattern }) => {
        BasePattern.reset();
        const tiHits: number[] = [];
        const debutHits: number[] = [];

        // Trailing window for the technicalindicators reference.
        const opens: number[] = [];
        const highs: number[] = [];
        const lows: number[] = [];
        const closes: number[] = [];

        bars.forEach((b) => {
            opens.push(b.open); highs.push(b.high); lows.push(b.low); closes.push(b.close);
            if (opens.length > required) { opens.shift(); highs.shift(); lows.shift(); closes.shift(); }
            if (opens.length === required) {
                if (tiPattern({ open: opens.slice(), high: highs.slice(), low: lows.slice(), close: closes.slice() })) {
                    tiHits.push(b.time);
                }
            }
            if (pattern.nextValue(b.open, b.high, b.low, b.close) === true) {
                debutHits.push(b.time);
            }
        });

        expect(debutHits).toEqual(tiHits);
        void name;
    });

    it('singleton buffer dedupes within a tick', () => {
        BasePattern.reset();
        const a = new debut.BullishEngulfingPattern();
        const b = new debut.BearishEngulfingPattern();
        // Run two patterns on the same bar — singleton should advance
        // only once. Test by comparing against a control run with one
        // pattern only.
        const dualHits: number[] = [];
        bars.forEach((bar) => {
            const fa = a.nextValue(bar.open, bar.high, bar.low, bar.close);
            const fb = b.nextValue(bar.open, bar.high, bar.low, bar.close);
            if (fa === true || fb === true) dualHits.push(bar.time);
        });

        BasePattern.reset();
        const aSolo = new debut.BullishEngulfingPattern();
        const bSolo = new debut.BearishEngulfingPattern();
        const aHits: number[] = [];
        const bHits: number[] = [];
        // Each pattern in its own pass also pushes the singleton, but
        // since buffer is singleton, they share it. To get isolated
        // baselines we reset between passes.
        bars.forEach((bar) => {
            if (aSolo.nextValue(bar.open, bar.high, bar.low, bar.close) === true) aHits.push(bar.time);
        });
        BasePattern.reset();
        bars.forEach((bar) => {
            if (bSolo.nextValue(bar.open, bar.high, bar.low, bar.close) === true) bHits.push(bar.time);
        });

        // Union of solo hits should equal dual hits.
        const union = Array.from(new Set([...aHits, ...bHits])).sort((x, y) => x - y);
        const dualSorted = dualHits.slice().sort((x, y) => x - y);
        expect(dualSorted).toEqual(union);
    });

    it('AllCandlestickPatterns matches per-pattern standalone runs', () => {
        BasePattern.reset();
        const all = new debut.AllCandlestickPatterns();
        const combined: Record<string, number[]> = {};
        bars.forEach((b) => {
            const fired = all.nextValue(b.open, b.high, b.low, b.close);
            for (const name of fired) {
                if (!combined[name]) combined[name] = [];
                combined[name].push(b.time);
            }
        });

        for (const { name, debut: PatternCtor } of [
            { name: 'Doji', debut: debut.Doji },
            { name: 'BullishEngulfingPattern', debut: debut.BullishEngulfingPattern },
            { name: 'ThreeBlackCrows', debut: debut.ThreeBlackCrows },
            { name: 'TweezerBottom', debut: debut.TweezerBottom },
        ]) {
            BasePattern.reset();
            const standalone = new (PatternCtor as any)();
            const expected: number[] = [];
            bars.forEach((b) => {
                if (standalone.nextValue(b.open, b.high, b.low, b.close) === true) expected.push(b.time);
            });
            expect(combined[name] || []).toEqual(expected);
        }
    });
});
