export function formatCount(n: number): string {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
    return String(n);
}


export function formatYoutubeDate(timestamp: number): string {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    const intervals: [number, string][] = [
        [60, "second"],
        [60, "minute"],
        [24, "hour"],
        [30, "day"],
        [12, "month"],
    ];

    let unit = "year";
    let value = seconds;

    for (let i = 0; i < intervals.length; i++) {
        if (value < intervals[i][0]) {
            unit = intervals[i][1];
            break;
        }
        value = Math.floor(value / intervals[i][0]);
        unit = intervals[i][1];
    }

    // pluralize if needed
    const label = value === 1 ? unit : `${unit}s`;

    return `${value} ${label} ago`;
}