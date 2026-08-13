const COLOR_MAP = {
  signal: 'bg-signal-dim text-signal',
  amber: 'bg-amber-dim text-amber',
  critical: 'bg-critical-dim text-critical',
  success: 'bg-success-dim text-success',
  muted: 'bg-canvas text-ink-muted'
};

export default function Badge({ color = 'muted', children }) {
  return (
    <span className={'text-xs font-medium px-2 py-0.5 rounded-md ' + COLOR_MAP[color]}>
      {children}
    </span>
  );
}