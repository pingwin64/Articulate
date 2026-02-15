export default function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="0"
        y="0"
        width="3"
        height="20"
        rx="1.5"
        fill="currentColor"
        opacity="0.5"
      />
      <rect
        x="10"
        y="3"
        width="3"
        height="14"
        rx="1.5"
        fill="currentColor"
        opacity="0.5"
      />
      <rect
        x="20"
        y="0"
        width="3"
        height="20"
        rx="1.5"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}
