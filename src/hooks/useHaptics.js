export function useHaptics() {
  function vibrate(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch {}
  }

  return {
    correctSwipe: () => vibrate([30]),
    wrongSwipe: () => vibrate([50, 30, 50]),
    pathNodeComplete: () => vibrate([20, 10, 20, 10, 60]),
    pathComplete: () => vibrate([30, 20, 30, 20, 100]),
  };
}
