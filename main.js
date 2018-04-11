import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Link } from 'react-router-dom';
import SpotifyLogin from './components/SpotifyLogin/SpotifyLogin';
import CardGrid from './components/CardGrid/CardGrid.js';
import Button from './components/Button/Button';
import * as fb from './DataWrapper/FirebaseDataWrapper.js';

class App extends React.Component {
  constructor(props){
    super(props);

    this.db = fb.getFbDb();

    this.state = {
      artists: [],
      loadedArtists: false
    };

    this.handleGetArtists = this.handleGetArtists.bind(this);
  }

  handleGetArtists(artists) {
    this.setState({
      artists: artists,
      loadedArtists: true
    });
  }

  componentDidMount() {
    fb.getArtists(this.db, this.handleGetArtists);
  }

  render() {
    return (
      <div>
        <Link to='/spotify-sync'>Synchronize Spotify Data</Link>
        <CardGrid cards={this.state.artists} loaded={this.state.loadedArtists}/>
      </div>
    );
  }
}

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route exact path="/" component={App} />
      <Route exact path="/spotify-sync" component={SpotifyLogin} />
    </Switch>
  </HashRouter>,
  document.getElementById('root')
);
