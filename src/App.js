import { HashRouter, Route, Switch } from 'react-router-dom'
import Lobby from './pages/Lobby'
import Editor from './pages/Editor'

function App() {

    return (
        <HashRouter>
            <Switch>
                <Route path='/' exact component={Lobby} />
                <Route path='/:room' component={Editor}/>
            </Switch>
        </HashRouter>
  );
}

export default App;
