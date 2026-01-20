import { useEffect, useRef, useState } from 'react';
import './App.css';

const getDatamatic = () => (typeof window === 'undefined' ? null : window.datamatic);

function App() {
  const pipelineRef = useRef(null);
  const intervalRef = useRef(null);
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [items, setItems] = useState(['alpha', 'beta', 'gamma']);
  const [newItem, setNewItem] = useState('');

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

    runSample();

    return () => subscription?.unsubscribe?.();
  }, []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const addItem = () => {
    const value = newItem.trim();
    if (!value) {
      return;
    }
    const nextItems = [...items, value];
    setItems(nextItems);
    setNewItem('');
    runSample(nextItems);
  };

  const removeItem = (index) => {
    const nextItems = items.filter((_, i) => i !== index);
    setItems(nextItems);
    runSample(nextItems);
  };

  const runSample = (list = items) => {
    setErrorMessage('');
    if (!pipelineRef.current) {
      return;
    }
    clearInterval(intervalRef.current);
    setData([]);

    let index = 0;
    let current = [];
    intervalRef.current = setInterval(() => {
      if (index >= list.length) {
        clearInterval(intervalRef.current);
        return;
      }
      current = current.concat(list[index]);
      pipelineRef.current.write(current);
      index += 1;
    }, 600);
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
          <div className="controls">
            <div className="controls-row">
              <input
                type="text"
                value={newItem}
                placeholder="Add an item"
                onChange={(event) => setNewItem(event.target.value)}
              />
              <button type="button" className="ghost" onClick={addItem}>
                Add item
              </button>
            </div>
            <div className="list">
              {items.map((item, index) => (
                <span className="list-item" key={`${item}-${index}`}>
                  {item}
                  <button type="button" onClick={() => removeItem(index)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
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
