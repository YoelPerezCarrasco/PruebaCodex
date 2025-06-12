import { useState } from 'react';

/* Minimal Tabs – compatible con cualquier versión de React
Props:
  labels: string[]
  panels: React.ReactNode[] (mismo orden)
*/
export default function Tabs({ labels, panels }) {
  const [idx, setIdx] = useState(0);

  return (
    <div className="flex flex-col h-full">
      {/* barra de pestañas */}
      <div className="flex space-x-2 mb-2">
        {labels.map((lab, i) => (
          <button
            key={lab}
            className={`px-3 py-1 rounded text-sm ${
              i === idx ? 'bg-emerald-600' : 'bg-zinc-700 hover:bg-zinc-600'
            }`}
            onClick={() => setIdx(i)}
          >
            {lab}
          </button>
        ))}
      </div>

      {/* panel activo */}
      <div className="flex-1 overflow-hidden">{panels[idx]}</div>
    </div>
  );
}
