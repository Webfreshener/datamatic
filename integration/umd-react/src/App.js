import logo from './logo.svg';
import './App.css';
import * as datamatic from "datamatic";

const _tx = new datamatic.Pipeline(
    {
        type: "array",
        items: {
            type: "string",
        },
    },
);

_tx.subscribe({
    next: (d) => console.log(d),
    error: alert,
})
_tx.write(["a", "b", "c"]);

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
            </header>
        </div>
    );
}

export default App;
