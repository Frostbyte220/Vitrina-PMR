export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window === "undefined") return;

  const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  if (ymId && window.ym) {
    window.ym(parseInt(ymId, 10), "reachGoal", eventName, eventParams);
  }
};
