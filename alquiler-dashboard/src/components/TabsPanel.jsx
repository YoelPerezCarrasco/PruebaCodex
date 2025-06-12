import { Tab } from '@headlessui/react';
import ParallelChart from './ParallelChart';
import Scatter from './Scatter';
import DensityLine from './DensityLine';

export default function TabsPanel({ serieParalelo, serieScatter, serieDens }) {
  return (
    <Tab.Group>
      <Tab.List className="flex space-x-2 mb-2">
        {['Paralelo', 'Scatter', 'Densidad'].map(txt => (
          <Tab
            key={txt}
            className={({ selected }) =>
              `px-3 py-1 rounded ${selected ? 'bg-emerald-600' : 'bg-zinc-700'} text-sm`
            }
          >
            {txt}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels className="flex-1">
        <Tab.Panel>
          <ParallelChart data={serieParalelo} />
        </Tab.Panel>
        <Tab.Panel>
          <Scatter data={serieScatter} />
        </Tab.Panel>
        <Tab.Panel>
          <DensityLine data={serieDens} />
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}
