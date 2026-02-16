
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`block w-14 h-8 rounded-full transition-colors ${
            checked ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        ></div>
        <div
          className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        ></div>
      </div>
      {label && <span className="mr-3 text-gray-700">{label}</span>}
    </label>
  );
}
