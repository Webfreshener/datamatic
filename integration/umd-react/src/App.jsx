import { useEffect, useRef, useState } from 'react';
import './App.css';

const sampleData = ['alpha', 'beta', 'gamma'];
const getDatamatic = () => (typeof window === 'undefined' ? null : window.datamatic);

function App() {
  const pipelineRef = useRef(null);
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  if (!pipelineRef.current) {
    const api = getDatamatic();
    if (api?.Pipeline) {
      pipelineRef.current = new api.Pipeline({
      type: 'array',
      items: {
        type: 'string'
      }
      });
    }
  }

  useEffect(() => {
    const api = getDatamatic();
    if (!api?.Pipeline) {
      setErrorMessage('Datamatic UMD bundle not loaded. Check public/datamatic.window.js.');
      return undefined;
    }

    const subscription = pipelineRef.current.subscribe({
      next: (payload) => {
        setData(Array.isArray(payload) ? payload : []);
      },
      error: (error) => {
        setErrorMessage(`${error ?? 'Unknown error'}`);
      }
    });

    pipelineRef.current.write(sampleData);

    return () => subscription?.unsubscribe?.();
  }, []);

  const runSample = () => {
    setErrorMessage('');
    pipelineRef.current?.write(sampleData);
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">React + Datamatic (UMD)</p>
          <h1>Datamatic React Integration</h1>
          <p className="lede">
            This example streams data from a Datamatic pipeline into a React
            component.
          </p>
        </div>
        <button type="button" className="cta" onClick={runSample}>
          Run sample
        </button>
      </header>

      <section className="panel">
        <h2>Pipeline output</h2>
        <p className="hint">Latest items emitted by the pipeline.</p>
        <div className="chips">
          {data.map((item) => (
            <span className="chip" key={item}>
              {item}
            </span>
          ))}
        </div>
        {data.length === 0 ? (
          <p className="empty">No data yet. Click "Run sample".</p>
        ) : null}
      </section>

      {errorMessage ? (
        <section className="panel error">
          <h2>Errors</h2>
          <p>{errorMessage}</p>
        </section>
      ) : null}
    </div>
  );
}

export default App;
