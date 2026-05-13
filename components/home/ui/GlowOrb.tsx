export default function GlowOrb({ className }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-full blur-[120px] opacity-30 pointer-events-none ${className}`}
    />
  );
}