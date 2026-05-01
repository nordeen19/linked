import { useRef, useCallback } from 'react';

const COMMIT_THRESHOLD = 100;
const TINT_THRESHOLD = 60;
const MAX_ROTATION = 15;

export function useSwipeGesture({ onSwipe, onDrag }) {
  const state = useRef({ startX: 0, startY: 0, isDragging: false, currentX: 0 });

  const getPos = (e) => {
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX, y: src.clientY };
  };

  const onStart = useCallback((e) => {
    const { x, y } = getPos(e);
    state.current = { startX: x, startY: y, isDragging: true, currentX: x };
  }, []);

  const onMove = useCallback((e) => {
    if (!state.current.isDragging) return;
    e.preventDefault();
    const { x } = getPos(e);
    state.current.currentX = x;
    const deltaX = x - state.current.startX;
    const rotation = Math.max(-MAX_ROTATION, Math.min(MAX_ROTATION, deltaX * 0.05));
    const direction = deltaX > TINT_THRESHOLD ? 'right' : deltaX < -TINT_THRESHOLD ? 'left' : null;
    onDrag({ deltaX, rotation, direction });
  }, [onDrag]);

  const onEnd = useCallback(() => {
    if (!state.current.isDragging) return;
    state.current.isDragging = false;
    const deltaX = state.current.currentX - state.current.startX;
    if (Math.abs(deltaX) > COMMIT_THRESHOLD) {
      onSwipe(deltaX > 0 ? 'right' : 'left');
    } else {
      onDrag({ deltaX: 0, rotation: 0, direction: null });
    }
  }, [onSwipe, onDrag]);

  return {
    onTouchStart: onStart,
    onTouchMove: onMove,
    onTouchEnd: onEnd,
    onMouseDown: onStart,
    onMouseMove: onMove,
    onMouseUp: onEnd,
    onMouseLeave: onEnd,
  };
}
