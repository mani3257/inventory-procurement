const VARIANTS = {
  primary: 'bg-signal text-white hover:bg-signal/90',
  secondary: 'border border-border text-ink hover:bg-canvas',
  danger: 'bg-critical text-white hover:bg-critical/90'
};

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      {...props}
      className={
        'text-sm font-medium rounded-lg px-4 py-2.5 transition disabled:opacity-50 ' +
        VARIANTS[variant] + ' ' + className
      }
    >
      {children}
    </button>
  );
}