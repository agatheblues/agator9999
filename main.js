import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Link, Redirect } from 'react-router-dom';
import SpotifySync from './components/SpotifySync/SpotifySync';
import SpotifyLogin from './components/SpotifyLogin/SpotifyLogin';
import SpotifyProfile from './components/SpotifyProfile/SpotifyProfile';
import CardGrid from './components/CardGrid/CardGrid';
import CreateAlbum from './components/CreateAlbum/CreateAlbum';
import Artist from './components/Artist/Artist';
import FirebaseSignIn from './components/FirebaseSignIn/FirebaseSignIn';
import Loading from './components/Loading/Loading';
import Button from './components/Button/Button';
import {init} from './helpers/FirebaseHelper.js';
import firebase from 'firebase';

require('./main.scss');

class App extends React.Component {
  constructor(props){
    super(props);

    init();

    this.state = {
      user: null,
      loaded: false
    };

    this.logout = this.logout.bind(this);

  }

  logout() {
    firebase.auth().signOut()
      .then(() => {
        this.setState({
          user: null
        });
      });
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          user,
          loaded: true
        });
      } else {
        this.setState({
          loaded:true
        });
      }
    });
  }


  render() {
    console.log('state', this.state);
    return (
      <div className='content-container'>

        {this.state.user && this.state.loaded &&
          <div>
            <div>
              <div className='user-profile'>
                <img src={this.state.user.photoURL} />
              </div>
              <Button
                id={'btn-fb-signout'}
                label={'Sign out'}
                handleClick={this.logout}
              />
            </div>
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
            <CardGrid />
          </div>
        }

        {!this.state.user && this.state.loaded &&
          <FirebaseSignIn />
        }

        {!this.state.loaded &&
          <Loading />
        }


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
