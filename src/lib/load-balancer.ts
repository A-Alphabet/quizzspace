type RouteLoad = {
  inFlight: number;
  rejected: number;
};

const routeLoadMap = new Map<string, RouteLoad>();

function getRouteLoad(routeKey: string): RouteLoad {
  const existing = routeLoadMap.get(routeKey);
  if (existing) return existing;

  const initial: RouteLoad = { inFlight: 0, rejected: 0 };
  routeLoadMap.set(routeKey, initial);
  return initial;
}

export function acquireLoadSlot(routeKey: string, maxConcurrent: number) {
  const routeLoad = getRouteLoad(routeKey);

  if (routeLoad.inFlight >= maxConcurrent) {
    routeLoad.rejected += 1;
    return { acquired: false as const };
  }

  routeLoad.inFlight += 1;

  let released = false;
  return {
    acquired: true as const,
    release: () => {
      if (released) return;
      released = true;
      routeLoad.inFlight = Math.max(0, routeLoad.inFlight - 1);
    },
  };
}

export function getLoadBalancerStats() {
  const routes = Array.from(routeLoadMap.entries()).map(([route, load]) => ({
    route,
    inFlight: load.inFlight,
    rejected: load.rejected,
  }));

  const totalInFlight = routes.reduce((sum, item) => sum + item.inFlight, 0);
  const totalRejected = routes.reduce((sum, item) => sum + item.rejected, 0);

  return {
    totalInFlight,
    totalRejected,
    routes,
  };
}
