const shimmerStyle = {
  background: 'linear-gradient(90deg, #EAECF0 25%, #F8F9FA 50%, #EAECF0 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: 4,
};

export default function SkeletonCard() {
  return (
    <div style={{
      width: 'calc(100% - 32px)',
      maxWidth: 340,
      borderRadius: 16,
      background: 'var(--color-surface-0)',
      boxShadow: 'var(--box-shadow-elevated)',
      overflow: 'hidden',
    }}>
      <div style={{ ...shimmerStyle, height: 180, borderRadius: 0 }} />
      <div style={{ padding: '12px 16px 16px' }}>
        <div style={{ ...shimmerStyle, height: 22, width: '75%', marginBottom: 10 }} />
        <div style={{ ...shimmerStyle, height: 14, width: '100%', marginBottom: 6 }} />
        <div style={{ ...shimmerStyle, height: 14, width: '85%', marginBottom: 14 }} />
        <div style={{ ...shimmerStyle, height: 20, width: 80, borderRadius: 9999 }} />
      </div>
    </div>
  );
}
