import { useEffect, useState } from 'react';
import * as d3 from 'd3';
function App() {
  const [data, setData] = useState(null);
  useEffect(() => {
    d3.dsv(';', '/src/data/alquiler_capitales.csv', d3.autoType)
      .then(setData);
  }, []);
  return (
    <div>
      <h1>Dashboard de alquileres</h1>
      <pre>{JSON.stringify(data?.slice(0, 5), null, 2)}</pre>
    </div>
  );
}
export default App;
