export default function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>}
      <input
        {...props}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-signal focus:border-transparent"
      />
    </div>
  );
}