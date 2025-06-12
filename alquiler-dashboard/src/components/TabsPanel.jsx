import Tabs from './Tabs';
import ParallelChart from './ParallelChart';
import Scatter from './Scatter';
import DensityLine from './DensityLine';

export default function TabsPanel({ serieParalelo, serieScatter, serieDens }) {
  return (
    <Tabs
      labels={['Paralelo', 'Scatter', 'Densidad']}
      panels={[
        <ParallelChart key="par" data={serieParalelo} />,
        <Scatter key="sca" data={serieScatter} />,
        <DensityLine key="den" data={serieDens} />,
      ]}
    />
  );
}
