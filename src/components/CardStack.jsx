import SwipeCard from './SwipeCard';

export default function CardStack({ cards, currentIndex, onSwipe }) {
  const visible = cards.slice(currentIndex, currentIndex + 3);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '8px 0',
    }}>
      {visible.map((card, i) => {
        const depth = visible.length - 1 - i;
        const scale = 1 - depth * 0.04;
        const translateY = depth * 6;
        const opacity = depth === 0 ? 1 : depth === 1 ? 0.6 : 0.3;

        return (
          <SwipeCard
            key={card.title + (currentIndex + i)}
            card={card}
            isTop={i === 0}
            onSwipe={onSwipe}
            style={{
              zIndex: 10 - depth,
              transform: i === 0
                ? undefined  // SwipeCard handles its own transform
                : `scale(${scale}) translateY(${translateY}px)`,
              opacity,
              transition: i === 0 ? undefined : 'all 200ms cubic-bezier(0.2, 0, 0, 1)',
              pointerEvents: i === 0 ? 'auto' : 'none',
            }}
          />
        );
      }).reverse()}
    </div>
  );
}
