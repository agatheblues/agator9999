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

    this.state = {
      artists: [],
      loadedArtists: false,
      albumCount: 0
    };

    this.handleSuccess = this.handleSuccess.bind(this);
    this.handleCountSuccess = this.handleCountSuccess.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  handleSuccess(artists) {
    this.setState({
      artists: artists,
      loadedArtists: true
    });
  }

  handleCountSuccess(count) {
    this.setState({
      albumCount: count
    });
  }

  handleError() {
    this.setState({
      artists: [],
      loadedArtists: false
    });
  }

  componentDidMount() {
    fb.getArtists(this.handleSuccess, this.handleError);
    fb.getAlbumCount(this.handleCountSuccess, this.handleError);
  }

  render() {
    return (
      <div className='content-container'>
        <nav className='menu-container'>
          <div className='menu-item-container'>
            <Link to='/spotify/sync'>Sync. Spotify Albums</Link>
          </div>
          <Link to='/album/create'>
            <div className='menu-item-container menu-item-container--icon'>
              <p className='menu-item'>New album</p>
              <img className='menu-icon' src='../static/images/Add-New-32.png' alt='plus-button'/>
            </div>
          </Link>
        </nav>
        <CardGrid
          cards={this.state.artists}
          loaded={this.state.loadedArtists}
          title='Artists'
          albumCount={this.state.albumCount}
        />
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
