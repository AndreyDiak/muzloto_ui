import { useState } from "react";

interface TeamNameFormProps {
  initialValue: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function TeamNameForm({ initialValue, onSubmit, onCancel }: TeamNameFormProps) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Название команды"
        className="w-full px-4 py-3 rounded-xl bg-surface-dark border border-neon-cyan/30 text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={() => onSubmit(value)}
          className="flex-1 py-2.5 rounded-xl bg-neon-cyan/20 text-white border border-neon-cyan/50 hover:bg-neon-cyan/30"
        >
          Готово
        </button>
      </div>
    </div>
  );
}
