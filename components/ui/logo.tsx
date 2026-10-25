/* ORBIT mark: orbital glyph in brand pink (plan §16/§24). */
export function OrbitMark({
  size = 22,
  color = 'var(--color-brand)',
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <ellipse cx="12" cy="12" rx="9.5" ry="4.6" stroke={color} strokeWidth="1.6" transform="rotate(-28 12 12)" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4.6" stroke={color} strokeWidth="1.6" opacity="0.45" transform="rotate(38 12 12)" />
      <circle cx="12" cy="12" r="3.4" fill={color} />
      <circle cx="19.4" cy="7.2" r="1.5" fill={color} />
    </svg>
  );
}
