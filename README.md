![npm](https://img.shields.io/npm/v/@debut/indicators)
![npm](https://img.shields.io/npm/dm/@debut/indicators)
![NPM](https://img.shields.io/npm/l/@debut/indicators)

# Streaming Technical Indicators

> **Sponsored by [Backticks](https://backticks.io)** — a visual canvas to build, backtest and optimize trading strategies in your browser. Built on top of this library.

A streaming, allocation-light technical-analysis toolkit for JavaScript / TypeScript. Every indicator is a class with a `nextValue(...)` method that consumes one bar at a time, so the same code path drives both backtests and live trading without rebuilding state. A second method, `momentValue(...)`, computes the indicator's value for a hypothetical bar without committing any state — useful for tick-by-tick recalculation inside an unfinished candle.

## Features

- **Streaming-first.** O(period) per bar; no full-array recomputation.
- **`momentValue` everywhere.** Ask "what would the value be if this bar closed now?" without mutating state.
- **TypeScript.** Strongly-typed across the public surface.
- **Cross-SDK validated.** 130+ jest tests cross-check our output against external reference libraries (`lwc` and `ti`) with epsilon ≤ 1e-9. See the **Test** column in the indicator tables below for which oracle each one is verified against.
- **Tiny package.** Ships only the prebuilt `lib/` bundle — ~85 kB tarball.

## Install

```bash
npm install @debut/indicators
```

## Quick start

```ts
import { SMA, RSI, MACD, BollingerBands } from '@debut/indicators';

const sma = new SMA(20);
const rsi = new RSI(14);
const macd = new MACD(12, 26, 9);
const bb = new BollingerBands(20, 2);

for (const bar of bars) {
    const sm = sma.nextValue(bar.close);
    const r = rsi.nextValue(bar.close);
    const m = macd.nextValue(bar.close);   // → { macd, signal, histogram }
    const b = bb.nextValue(bar.close);     // → { lower, middle, upper }
    // ...indicator outputs are `undefined` until each one's warmup completes.
}
```

`nextValue` returns `undefined` until the indicator has seen enough bars to produce a result (its "warmup" — typically `period` bars). After that it returns the current value on every call.

## Streaming model

### `nextValue(...)` — close-of-bar

Call this once per closed bar. The method advances internal state and returns the new indicator value. Subsequent calls reflect the committed state.

### `momentValue(...)` — intra-bar

Call this with the live (still-forming) candle's price/volume to read what the indicator *would* report if the bar closed now, **without** committing any state. Useful when you want to react inside the candle but recompute cleanly when the next real `nextValue` arrives.

```ts
const sma = new SMA(4);
[1, 2, 3].forEach((v) => sma.nextValue(v));   // warmup
sma.momentValue(8);   // 3.5  ← preview if close=8
sma.nextValue(4);     // 2.5  ← actual close=4 commits state
sma.momentValue(8);   // 4.75 ← preview based on committed state
sma.nextValue(8);     // 4.25 ← actual close=8 commits state
```

---

## Available indicators

Below is the full catalog grouped by category. Names in `code style` are the exact named export from `@debut/indicators`. Linkable indicator names lead to a per-indicator doc page in [`docs/`](./docs). The **Test** column marks which external library the cross-SDK validation runs against — `` `lwc` `` = `lightweight-charts-indicators`, `` `ti` `` = `technicalindicators` (see [Cross-SDK validation](#cross-sdk-validation) for what that means).

### Moving Averages

| Indicator | Export | Test | Description |
|-----------|--------|------|-------------|
| [Simple Moving Average](./docs/SimpleMovingAverage.md) | `SMA` | `ti` | Arithmetic mean over a period. |
| [Exponential Moving Average](./docs/ExponentialMovingAverage.md) | `EMA` | `ti` | Weighted average emphasizing recent prices. |
| [Weighted Moving Average](./docs/WeightedMovingAverage.md) | `WMA` | `ti` | Linearly increasing weights toward the latest bar. |
| [Linearly Weighted MA](./docs/LinearlyWeightedMovingAverage.md) | `LWMA` | | Linear weighting variant. |
| [Exponential Weighted MA](./docs/ExponentialWeightedMovingAverage.md) | `EWMA` | | Configurable α; lighter than EMA for tick smoothing. |
| [Smoothed Moving Average](./docs/SmoothedMovingAverage.md) | `SMMA` | | Wilder smoothing (α = 1/period). |
| [Wilder's Smoothed MA](./docs/WildersSmoothedMovingAverage.md) | `WEMA` | `ti` | Same shape as `RMA`, included for compatibility. |
| [Welles Wilder's Smoothing](./docs/WellesWildersSmoothingAverage.md) | `WWS` | | Classic Wilder smoothing. |
| [Adaptive Moving Average](./docs/AdaptiveMovingAverage.md) | `AMA` | | Kaufman adaptive — speeds up in trend, slows in chop. |
| Running Moving Average | `RMA` | | α = 1/period; SMA-seeded. |
| Hull Moving Average | `HMA` | `lwc` | Reduced-lag MA via WMA chaining. |
| Double EMA | `DEMA` | `lwc` | 2 × EMA − EMA(EMA). |
| [Triple EMA](./docs/TEMA.md) | `TEMA` | | Three-stage EMA reduction of lag. |
| Arnaud Legoux MA | `ALMA` | `lwc` | Gaussian-weighted MA. |
| Volume Weighted MA | `VWMA` | `lwc` | Each bar weighted by volume. |
| McGinley Dynamic | `McGinleyDynamic` | `lwc` | Self-adjusting MA reacting to market speed. |
| Least Squares MA | `LSMA` | `lwc` | Endpoint of rolling linear regression. |

### Oscillators

| Indicator | Export | Test | Description |
|-----------|--------|------|-------------|
| [Relative Strength Index](./docs/RelativeStrengthIndex.md) | `RSI` | `ti` | Classic 14-period momentum oscillator. |
| [Stochastic](./docs/StochasticOscillator.md) | `Stochastic` | `ti` | Close vs. high-low range. |
| [Stochastic RSI](./docs/StochasticRsi.md) | `StochasticRSI` | `ti` | Stochastic applied to RSI. |
| [Commodity Channel Index](./docs/CommodityChannelIndex.md) | `CCI` | `ti` | Deviation-from-mean cyclic oscillator. |
| Williams %R | `Williams` | | Inverse-stochastic momentum. |
| [Awesome Oscillator](./docs/AwesomeOscillator.md) | `AO` | `ti` | Bill Williams 5/34 SMA difference of HL2. |
| [Accelerator Oscillator](./docs/AcceleratorOscillator.md) | `AC` | | Bill Williams AO derivative. |
| [Chande Momentum Oscillator](./docs/CMO.md) | `CMO` | | Wilder-style CMO. |
| Chande MO (LWC) | `ChandeMO` | `lwc` | LWC reference variant; raw rolling sums. |
| [Detrended Price Oscillator](./docs/DPO.md) | `DPO` | | SMA-detrended price. |
| Relative Vigor Index | `RVI` | `lwc` | SWMA-based vigor / signal pair. |
| SMI Ergodic | `SMIErgodic` | `lwc` | Double-smoothed momentum (TSI without 100×). |
| True Strength Index | `TSI` | `lwc` | Double-EMA momentum oscillator with signal. |
| Bollinger Bands %B | `BBPercentB` | `lwc` | Price position relative to BB. |
| Fisher Transform | `FisherTransform` | `lwc` | Gaussian-mapped price extremes. |
| [Ultimate Oscillator](./docs/UltimateOscillator.md) | `UltimateOscillator` | | Multi-timeframe weighted momentum. |
| [Connor's RSI](./docs/ConnorsRSI.md) | `cRSI` | | Composite RSI / streak / percent-rank. |
| Relative Volatility Index | `RelativeVolatilityIndex` | `lwc` | RSI on stdev of close. |

### Momentum

| Indicator | Export | Test | Description |
|-----------|--------|------|-------------|
| [MACD](./docs/MovingAverageConvergenceDivergence.md) | `MACD` | `ti` | Difference of two EMAs with signal/histogram. |
| Momentum | `Momentum` | `lwc` | `close − close[length]`. |
| [Rate of Change](./docs/RateofChange.md) | `ROC` | `ti` | Percentage change over a period. |
| Balance of Power | `BOP` | `lwc` | `(close − open) / (high − low)`. |
| Bull-Bear Power | `BullBearPower` | `lwc` | Elder: `high + low − 2·EMA(close)`. |
| [Force Index](./docs/ForceIndex.md) | `ForceIndex` | | Elder: signed price-volume impulse. |
| [Elder Ray](./docs/ElderRay.md) | `ElderRay` | | Bull / bear power split. |
| Price Oscillator | `PriceOscillator` | `lwc` | Percent-PPO with signal/histogram. |
| Coppock Curve | `CoppockCurve` | `lwc` | WMA of summed long/short ROCs. |
| [TRIX](./docs/TRIX.md) | `TRIX` | `ti` | ROC of triple-smoothed EMA. |
| KST | `KST` | `lwc` | "Know Sure Thing" weighted ROC sum + signal. |

### Trend

| Indicator | Export | Test | Description |
|-----------|--------|------|-------------|
| [Average Directional Index](./docs/AverageDirectionalIndex.md) | `ADX` | `ti` | Trend strength irrespective of direction. |
| [Directional Movement Index](./docs/DMI.md) | `DMI` | | `+DI`, `−DI`, ADX. |
| [Ichimoku Cloud](./docs/IchimokuCloud.md) | `Ichimoku` | | Conversion / base / spans / lagging. |
| [Parabolic SAR](./docs/ParabolicStopAndReverse.md) | `PSAR` | `ti` | Welles Wilder's trailing stop. |
| [Supertrend](./docs/SuperTrend.md) | `SuperTrend` | | ATR-based dynamic support/resistance. |
| Aroon | `Aroon` | `lwc` | Bars-since-extreme up/down lines. |
| Choppiness | `Choppiness` | `lwc` | Range-vs-volatility chop measure. |
| Mass Index | `MassIndex` | `lwc` | Reversal detection via H-L EMA ratio. |
| Vortex | `Vortex` | `lwc` | VI+ / VI− directional pair. |
| Trend Strength Index | `TrendStrengthIndex` | `lwc` | Pearson correlation of close vs. bar index. |
| Chande Kroll Stop | `ChandeKrollStop` | `lwc` | Long / short ATR-based stop levels. |

### Volatility

| Indicator | Export | Test | Description |
|-----------|--------|------|-------------|
| [Average True Range](./docs/AverageTrueRange.md) | `ATR` | `ti` | Wilder ATR with selectable smoothing. |
| Average Daily Range | `ADR` | `lwc` | SMA of `high − low`. |
| Historical Volatility | `HistoricalVolatility` | `lwc` | Annualized stdev of log returns. |
| Bollinger BandWidth | `BBBandWidth` | `lwc` | `(upper − lower) / basis × 100`. |
| Standard Deviation | `StandardDeviation` | | Streaming biased stdev provider. |

### Channels & Bands

| Indicator | Export | Test | Description |
|-----------|--------|------|-------------|
| [Bollinger Bands](./docs/BollingerBands.md) | `BollingerBands` | `ti` | SMA ± k × stdev. |
| [Donchian Channels](./docs/DonchianChannels.md) | `DC` | | Highest-high / lowest-low envelope. |
| [Keltner Channel](./docs/KeltnerChannel.md) | `KeltnerChannel` | `ti` | EMA / ATR envelope. |
| [Envelopes](./docs/Envelopes.md) | `Envelopes` | `ti` | Fixed-percentage MA bands. |
| Median (with bands ready upstream) | `Median` | `lwc` | Rolling median of HL2. |

### Volume

| Indicator | Export | Test | Description |
|-----------|--------|------|-------------|
| On Balance Volume | `OBV` | `lwc` | Cumulative signed volume. |
| [Money Flow Index](./docs/MoneyFlowIndex.md) | `MFI` | `ti` | Volume-weighted RSI. |
| Price Volume Trend | `PVT` | `lwc` | Volume scaled by relative price change. |
| [Volume Oscillator](./docs/VolumeOscillator.md) | `VolumeOscillator` | `ti` | Difference between volume EMAs. |
| [Chaikin Oscillator](./docs/ChaikinOscillator.md) | `ChaikinOscillator` | | EMA spread of A/D line. |
| Chaikin Money Flow | `ChaikinMF` | `lwc` | A/D divided by volume over a window. |
| Ease of Movement | `EaseOfMovement` | `lwc` | Price change vs. volume. |
| Klinger Oscillator | `Klinger` | `lwc` | Long-term money-flow oscillator. |
| Net Volume | `NetVolume` | `lwc` | Signed volume by candle direction. |
| [Volume Profile](./docs/VolumeProfile.md) | `VolumeProfile` | | Session histogram with POC / VAH / VAL. |

### Candles & Pivots

| Indicator | Export | Test | Description |
|-----------|--------|------|-------------|
| Heiken Ashi | `HeikenAshi` | | Smoothed candle stream. |
| [Fractal](./docs/Fractal.md) | `Fractal` | | Bill Williams 5-bar fractals. |
| [Pivot Levels](./docs/PivotPointLevels.md) | `Pivot` | | Classic / Woodie / Camarilla / Fibonacci. |
| Trend Lines | `TrendLines` | | Pivot-derived trend line detection. |
| Extremums | `Extremums` | | Fractal-style local extrema provider. |

### Move / Wave (custom)

| Indicator | Export | Description |
|-----------|--------|-------------|
| Move | `Move` | Direction move with minimum power `p`. |
| Wave | `Wave` | Bullish/bearish candle series with power `p`. |

## Runtime state save & restore

Every stateful indicator exposes two methods:

- `dumpState()` returns a JSON-safe snapshot of all internal runtime state.
- `restoreState(state)` restores that snapshot into a new indicator instance and returns the instance.

The snapshot includes nested providers and rolling buffers such as `CircularBuffer`, so an indicator can continue after a process restart without replaying the full history. Constructor parameters are still part of the indicator configuration: restore state into an instance created with the same period/options that produced the snapshot.

```ts
import { EMA } from '@debut/indicators';

const ema = new EMA(20);

for (const close of history) {
    ema.nextValue(close);
}

// Persist this string in your own runtime storage: database, file, Redis, etc.
const serialized = JSON.stringify(ema.dumpState());

// Later, after a restart:
const restored = new EMA(20).restoreState(JSON.parse(serialized));

const liveValue = restored.nextValue(nextClose);
```

For live systems, save the state after committing each closed bar, together with the indicator configuration and stream identity. On startup, recreate each indicator with the same constructor arguments, call `restoreState(...)`, then continue feeding new bars through `nextValue(...)`.

## Candlestick Patterns

Each is a streaming class:

```ts
import { Doji, BullishEngulfingPattern, HammerPattern } from '@debut/indicators';

const doji = new Doji();
const engulfing = new BullishEngulfingPattern();
const hammer = new HammerPattern();   // 5-bar with confirmation candle

for (const bar of bars) {
    if (doji.nextValue(bar.open, bar.high, bar.low, bar.close)) console.log('Doji', bar.time);
    if (engulfing.nextValue(bar.open, bar.high, bar.low, bar.close)) console.log('Bull Engulfing', bar.time);
    if (hammer.nextValue(bar.open, bar.high, bar.low, bar.close)) console.log('Hammer', bar.time);
}
```

`nextValue` returns `true` when the pattern fires, `false` if not, and `undefined` while it's still warming up (multi-bar patterns need their full lookback first).

### Configurable thresholds

Each pattern accepts an options bag in its constructor. The defaults match the `ti` reference exactly; tighten or loosen them as you see fit.

| Option | Used by | Default | Description |
|--------|---------|---------|-------------|
| `precision` | Doji-family, Marubozu, hammer-stick, HaramiCross, HammerPattern, HangingMan, ShootingStar, Abandoned/Doji-Star variants | `0.001` | Fuzzy-match tolerance: how close `open`≈`close` (or `body`-touches-`high`/`low`) must be to qualify as "equal". `0.001` ≈ 0.1% relative. |
| `shadowToBodyRatio` | Hammer-stick variants, HammerPattern, HangingMan, ShootingStar | `2` | The opposing shadow must be at least this many times the body length. |
| `minShadowToBodyRatio` | SpinningTop variants | `1` | Both shadows must be strictly larger than the body by this ratio. |
| `equalityTolerance` | Tweezer-Bottom/Top | `0` (exact) | How close `low[i]`/`high[i]` of the two candles must be. |
| `confirm` | HammerPattern, HangingMan, ShootingStar | `true` | Require the 5th bar's confirmation candle. The `*Unconfirmed` variants flip this to `false`. |

```ts
const wideDoji = new Doji({ precision: 0.005 });           // 0.5% relative tolerance
const fastHammer = new HammerPattern({ confirm: false });  // skip the confirmation candle
const looseTweezer = new TweezerBottom({ equalityTolerance: 0.0001 });
```

### Combined scanners

If you want to scan a bar against many patterns at once, use one of the three combined scanners. They share the singleton `OhlcBuffer` declared inside the patterns module so you don't pay for per-pattern buffers.

```ts
import { AllCandlestickPatterns, BullishPatterns, BearishPatterns } from '@debut/indicators';

const all = new AllCandlestickPatterns();
const bull = new BullishPatterns();
const bear = new BearishPatterns();

for (const bar of bars) {
    const fired = all.nextValue(bar.open, bar.high, bar.low, bar.close);
    if (fired.length) console.log(bar.time, fired);
    // → e.g. [1700000000, ['BullishHammerStick', 'BullishMarubozu']]

    if (bull.nextValue(bar.open, bar.high, bar.low, bar.close)) console.log('any bullish');
    if (bear.nextValue(bar.open, bar.high, bar.low, bar.close)) console.log('any bearish');
}
```

`AllCandlestickPatterns.nextValue` returns the array of pattern names that fired on the bar; `BullishPatterns` / `BearishPatterns` return a single boolean ("did *any* pattern fire").

### Singleton buffer & resetting between streams

All multi-bar patterns share one `OhlcBuffer(5)` declared at module scope in `src/candlestick/patterns.ts`. The first pattern that sees a brand-new bar advances the buffer; later calls within the same tick are dedup'd by OHLC equality. This means dropping in a fresh pattern instance is essentially free — there's no per-pattern ring allocation.

If you switch between independent bar streams (or want a clean slate between test cases), call `BasePattern.reset()`:

```ts
import { BasePattern } from '@debut/indicators/lib/src/candlestick/patterns';

BasePattern.reset(); // clears the singleton OHLC ring + dedupe state
```

### Namespaced import

If you'd rather not pull 35 symbols into scope:

```ts
import { Candlestick } from '@debut/indicators';

const doji = new Candlestick.Doji();
const all = new Candlestick.AllCandlestickPatterns();
```

### Pattern catalog

| Lookback | Patterns |
|----------|----------|
| 1 bar    | `Doji`, `DragonFlyDoji`, `GraveStoneDoji`, `BearishHammerStick`, `BullishHammerStick`, `BearishInvertedHammerStick`, `BullishInvertedHammerStick`, `BearishMarubozu`, `BullishMarubozu`, `BearishSpinningTop`, `BullishSpinningTop` |
| 2 bars   | `BearishEngulfingPattern`, `BullishEngulfingPattern`, `BearishHarami`, `BullishHarami`, `BearishHaramiCross`, `BullishHaramiCross`, `DarkCloudCover`, `PiercingLine` |
| 3 bars   | `AbandonedBaby`, `DownsideTasukiGap`, `EveningStar`, `EveningDojiStar`, `MorningStar`, `MorningDojiStar`, `ThreeBlackCrows`, `ThreeWhiteSoldiers` |
| 5 bars   | `HammerPattern`, `HammerPatternUnconfirmed`, `HangingMan`, `HangingManUnconfirmed`, `ShootingStar`, `ShootingStarUnconfirmed`, `TweezerBottom`, `TweezerTop` |

## Session Volume Profile

`VolumeProfile` aggregates traded volume across price rows and exposes **POC**, **VAH** / **VAL** with configurable `tickSize`, distribution, and session anchoring (`'daily'` by default — unbounded streams can't grow the row map forever).

```ts
import { VolumeProfile } from '@debut/indicators';
const vp = new VolumeProfile({ tickSize: 0.5 });
for (const bar of bars) {
    const { poc, val, vah, total } = vp.nextValue(bar);
}
```

Full options, formula, performance notes, and custom-session recipe: **[docs/VolumeProfile.md](./docs/VolumeProfile.md)**.

## Utilities

| Export | Description |
|--------|-------------|
| `CircularBuffer` | Fixed-size ring buffer with `at()` / `peek()` / `forEach()`. Powers most rolling-window indicators. |
| `Sampler` | Sample-of-sample provider for stacking smoothing (e.g. `SMA(SMA(SMA(...)))`). |
| `Correlation` | Streaming Pearson correlation. |
| `Level`, `UniLevel` | Dynamic level (UniLevel: balanced around 0). |
| `Extremums` | Fractal-style local extrema. |
| `Candles` | Per-bar candlestick context (body, shadows, doji, trend) shared by pattern detectors. |

## Cross-SDK validation

Every ported indicator and candlestick pattern has a vitest-style spec in `tests/<name>/<name>.spec.ts` that:

1. Generates deterministic synthetic OHLCV bars with a seeded LCG (see `tests/lwc-fixtures.ts`).
2. Runs them through the streaming `@debut/indicators` class.
3. Runs the same bars through the corresponding `lwc` `calculate()` (or `ti` for the older specs) — see the **Test** column in each indicator table for which oracle that pattern is matched against.
4. Asserts numeric equality with epsilon ≤ 1e-9 (or set membership for boolean pattern firings).

Run `npm test` to execute the full suite.

## Benchmarks

Apple M1 Pro, Node v16.14.0. Tested on dataset with 100k elements.

| Indicator name | @debut/indicators (ops/sec) | technicalindicators (ops/sec) | indicatorts (ops/sec) |
|:---:|:---:|:---:|:---:|
| AwesomeOscillator | 318 | 23 | 158 |
| ADX | 358 | 42 | x |
| ATR | 613 | 136 | 95 |
| Bollinger Bands | 347 | 9 | 219 |
| CCI | 151 | 12 | 158 |
| DC | 474 | x | 74 |
| PSAR | 1,453 | 278 | 666 |
| EMA | 1,720 | 452 | 1,537 |
| MACD | 1,417 | 90 | 467 |
| ROC | 3,625 | 64 | x |
| RSI | 1,239 | 38 | 315 |
| SMA | 678 | 65 | 645 |
| WEMA | 1,462 | 455 | x |
| WMA | 287 | 41 | x |
| Stochastic | 340 | 25 | 67 |

*Benchmarks results is autogenerated by https://github.com/debut-js/indicators-benchmark*

## License

GPL-3.0
