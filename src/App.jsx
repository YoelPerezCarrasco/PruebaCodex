import React, { useEffect } from 'react';
import useAlquilerData from './hooks/useAlquilerData';

function App() {
  const { records } = useAlquilerData();

  useEffect(() => {
    if (records.length) {
      console.log(records.slice(0, 3));
    }
  }, [records]);

  return <div>App</div>;
}

export default App;
