## What

Add a segmented control: `Top 10`, `Top 25`, `All`.

## Why

Prevents unreadable charts and makes the UI instantly feel professional.

## How

- Sort languages descending by count (this is already done by the backend)
- If Top 10/25 selected: slice N and sum the rest into `{ name: "Other", count: sum}`
- You can get creative about the color for "Other"
- Apply this to all charts
- Ensure the `10` and `25` are configurable so we can easily change/extend in the future if we want other segment

## Success criteria

- Switching Top-N updates chart instantly
- "Other" appears only when applicable