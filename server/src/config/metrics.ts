type Metrics = {
  requestsTotal: number;
  failuresTotal: number;
  totalDurationMs: number;
  routes: Record<string, { count: number; failures: number; totalMs: number }>;
};

export const metrics: Metrics = {
  requestsTotal: 0,
  failuresTotal: 0,
  totalDurationMs: 0,
  routes: {},
};

export const recordRequestMetric = (
  route: string,
  durationMs: number,
  failed: boolean
) => {
  metrics.requestsTotal += 1;
  metrics.totalDurationMs += durationMs;

  if (failed) {
    metrics.failuresTotal += 1;
  }

  if (!metrics.routes[route]) {
    metrics.routes[route] = {
      count: 0,
      failures: 0,
      totalMs: 0,
    };
  }

  metrics.routes[route].count += 1;
  metrics.routes[route].totalMs += durationMs;

  if (failed) {
    metrics.routes[route].failures += 1;
  }
};

export const getMetricsSnapshot = () => ({
  ...metrics,
  averageDurationMs:
    metrics.requestsTotal === 0
      ? 0
      : Math.round(metrics.totalDurationMs / metrics.requestsTotal),
});
