import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Link, Redirect } from 'react-router-dom';
import SpotifySync from './components/SpotifySync/SpotifySync';
import SpotifyLogin from './components/SpotifyLogin/SpotifyLogin';
import SpotifyProfile from './components/SpotifyProfile/SpotifyProfile';
import CardGrid from './components/CardGrid/CardGrid';
import CreateAlbum from './components/CreateAlbum/CreateAlbum';
import Artist from './components/Artist/Artist';
import * as fb from './DataWrapper/FirebaseDataWrapper';
require('./main.scss');

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
      <div className='content-container'>
        <Link to='/spotify/sync'>Synchronize Spotify Data</Link>
        <Link to='/album/create'>Add album</Link>
        <SpotifyProfile />
        <CardGrid cards={this.state.artists} loaded={this.state.loadedArtists} title='Artists'/>
      </div>
    );
  }
}

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route exact path="/" component={App} />
      <Route exact path="/spotify/sync" component={SpotifySync} />
      <Route exact path="/spotify/login" component={SpotifyLogin} />
      <Route path="/:access_token(access_token=.*)" component={SpotifyLogin} />
      <Route exact path="/album/create" component={CreateAlbum} />
      <Route exact path="/artist/:id" component={Artist} />
    </Switch>
  </HashRouter>,
  document.getElementById('root')
);
