# Session Volume Profile

A Volume Profile aggregates traded volume across price levels over a session and exposes the three classical orderflow markers used by tape-readers and auction-theory traders:

- **POC** (Point of Control) — price row with the largest accumulated volume.
- **VAH / VAL** (Value Area High / Low) — bounds of the contiguous price range around the POC that captures `valueAreaPercent` of the session's total volume (default `0.7` = 70%).

## Formula

```
1. Bin each candle's volume into rows of size `tickSize`
   (rows cover `[price, price + tickSize)`).
2. POC = argmax_row(volume).
3. VA expansion (start at POC, repeat until cumulative ≥ total · VA%):
     above = volume(row above current envelope)
     below = volume(row below current envelope)
     if above ≥ below: extend envelope upward, cumulative += above
     else            : extend envelope downward, cumulative += below
4. VAL = lower edge of the lowest row in the envelope.
   VAH = upper edge of the highest row in the envelope.
```

## How a candle's volume gets distributed (option `distribution`)

| Value | Behaviour |
|-------|-----------|
| `'uniform'` *(default)* | Spread evenly across every row touched by `[low, high]`. Most accurate when a candle's range covers many rows. |
| `'typical'` | Concentrate at the typical price `(high + low + close) / 3`. |
| `'close'` | Concentrate at `close`. Cheapest and most deterministic. |

## Sessions (option `session`)

The default is **`'daily'`** — an unbounded stream feeding `nextValue` cannot grow the row map forever. Switch to `'continuous'` only for short bounded backtests, or when you take responsibility for `reset()`-ing yourself.

| Value | Reset trigger |
|-------|---------------|
| `'daily'` *(default)* | Automatic — when the next candle's UTC-day bucket differs from the session-start's bucket. |
| `'weekly'` | Automatic — UTC-week bucket. |
| `'continuous'` | Never automatic — call `vp.reset()` yourself. |
| `{ lookback: N }` | Automatic rolling window — the oldest bar is `subtract`-ed when bar `N+1` arrives. |

`vp.reset()` always works as a manual override regardless of mode.

## Parameters

| Option | Default | Description |
|--------|---------|-------------|
| `tickSize` | `1` | Row size in price units. Smaller = finer histogram, more rows. |
| `valueAreaPercent` | `0.7` | Fraction of total volume captured by the Value Area envelope. |
| `distribution` | `'uniform'` | Per-candle volume allocation strategy (see table above). |
| `session` | `'daily'` | Session anchoring policy (see table above). |

## Streaming API

```ts
import { VolumeProfile } from '@debut/indicators';

const vp = new VolumeProfile({
    tickSize: 0.5,
    distribution: 'uniform',
    valueAreaPercent: 0.7,
    session: 'daily',
});

for (const bar of bars) {
    // bar = { o, h, l, c, v, time }   // `time` in ms since epoch
    const { poc, val, vah, total } = vp.nextValue(bar);
    // poc / val / vah / total reflect the post-commit session state
}
```

### `nextValue(candle)`

Commits the bar into the histogram. Returns the post-commit snapshot
`{ poc, val, vah, total }` so callers don't need a separate getter
round-trip in the hot path. Triggers an automatic session reset if
the candle crosses the configured boundary.

### `momentValue(candle)`

Previews the same snapshot for a hypothetical bar **without committing
state** — handy for tick-by-tick recomputation while a candle is still
forming. Implementation: commit, snapshot, revert via the symmetric
subtract path. Net mutation is zero.

### Individual getters

```ts
vp.poc();          // POC price (number | undefined)
vp.valueArea();    // { val, vah } | undefined
vp.vah();          // shortcut: valueArea()?.vah
vp.val();          // shortcut: valueArea()?.val
vp.totalVolume();  // sum of all rows
vp.profile();      // full sorted histogram: [{ price, volume }, ...]
vp.sessionStart(); // ms timestamp of the first bar in the current session
vp.reset();        // wipe everything (use to anchor custom sessions on top of 'continuous')
```

## Performance notes

The hot path (`nextValue`) is `O(rowsPerCandle · log N)` where N is
the number of populated rows in the current session.

- Each row update is O(1) on a `Map<idx, vol>`.
- New rows are inserted into a sorted index via binary search
  (O(log N) lookup, O(N) splice for the insertion). For typical
  histograms with a few hundred rows this is microseconds per bar.
- The **POC is tracked incrementally**: additive updates compare the
  new row volume against the running max in O(1). Subtractive
  updates (only used in `lookback` mode) mark the POC dirty and
  trigger one O(N) re-scan on the next query — never on the push.
- `valueArea()` walks two pointers outward from the POC across the
  sorted index — `O(M)` where M = rows inside the area. No nested
  scans.
- `profile()` walks the maintained sorted index directly — no
  per-call sort.

## When to call `reset()`

You almost never need to in `'daily'` / `'weekly'` / `lookback` modes
— the session resets automatically. Manual cases:

- You want a custom session anchor (e.g. NY market open at 09:30 ET):
  use `session: 'continuous'` and call `vp.reset()` yourself on the
  first bar of each session.
- You're reusing a `VolumeProfile` instance to scan multiple
  independent symbols.
- You want to discard accumulated state between backtest runs.

## Custom session anchors

If you need a session boundary that isn't UTC-aligned (most equity
markets), wire it on top of `'continuous'`:

```ts
const vp = new VolumeProfile({ tickSize: 0.5, session: 'continuous' });
let lastSessionKey: string | undefined;

for (const bar of bars) {
    const key = sessionKey(bar.time); // your function: returns e.g. '2024-01-15-NY'
    if (lastSessionKey !== undefined && lastSessionKey !== key) vp.reset();
    lastSessionKey = key;
    vp.nextValue(bar);
}
```
