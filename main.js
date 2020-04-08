// import { init, getUser, getFbSignOut, getAuth } from './helpers/FirebaseHelper.js';
// import FirebaseSignIn from './components/FirebaseSignIn/FirebaseSignIn';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import ArtistPage from './pages/ArtistPage';
import ArtistMergePage from './pages/ArtistMergePage';
import ArtistUnmerge from './components/ArtistUnmerge/ArtistUnmerge';
import CreateAlbumPage from './pages/CreateAlbumPage';
import HomePage from './pages/HomePage';
import Loading from './components/Loading/Loading';
import PageNotFound from './components/PageNotFound/PageNotFound';
import React from 'react';
import ReactDOM from 'react-dom';
import SpotifyLogin from './components/SpotifyLogin/SpotifyLogin';
import SpotifySyncPage from './pages/SpotifySyncPage';

require('./main.scss');

class App extends React.Component {
  constructor(props) {
    super(props);

    // init();

    this.state = {
      user: {
        photoURL: 'https://placekitten.com/300/300',
        displayName: 'Prout'
      },
      isAdmin: true,
      loaded: false
    };

    this.setUserToState = this.setUserToState.bind(this);
    // this.logout = this.logout.bind(this);
    this.renderHomePage = this.renderHomePage.bind(this);
    this.renderSpotifySyncPage = this.renderSpotifySyncPage.bind(this);
    this.renderSpotifyLogin = this.renderSpotifyLogin.bind(this);
    this.renderCreateAlbumPage = this.renderCreateAlbumPage.bind(this);
    this.renderArtistPage = this.renderArtistPage.bind(this);
    this.renderArtistMergePage = this.renderArtistMergePage.bind(this);
    this.renderArtistUnmerge = this.renderArtistUnmerge.bind(this);
  }

  checkIfAdmin(data) {
    let isAdmin = false;

    data.forEach(function (item) {
      isAdmin = item.val().isAdmin;
    });

    return isAdmin;
  }

  setUserToState(user, data) {
    this.setState({
      user,
      loaded: true,
      isAdmin: this.checkIfAdmin(data)
    });
  }


  // persistUserAuth() {
  //   getAuth()
  //     .onAuthStateChanged((user) => {
  //       if (user) {
  //         getUser(user.email)
  //           .then((data) => this.setUserToState(user, data));
  //       } else {
  //         this.setState({
  //           loaded: true
  //         });
  //       }
  //     });
  // }


  // logout() {
  //   getFbSignOut()
  //     .then(() => {
  //       this.setState({
  //         user: null,
  //         isAdmin: false,
  //         loaded: true
  //       });
  //     });
  // }


  componentDidMount() {
    // this.persistUserAuth();
  }


  renderHomePage() {
    return <HomePage user={this.state.user} logout={this.logout} isAdmin={this.state.isAdmin} />;
  }


  renderSpotifySyncPage() {
    if (!this.state.isAdmin) {
      return <Redirect to="/404" />;
    }
    return <SpotifySyncPage />;
  }

  renderSpotifyLogin() {
    if (!this.state.isAdmin) {
      return <Redirect to="/404" />;
    }
    return <SpotifyLogin />;
  }

  renderCreateAlbumPage() {
    if (!this.state.isAdmin) {
      return <Redirect to="/404" />;
    }
    return <CreateAlbumPage />;
  }

  renderArtistPage(props) {
    return <ArtistPage {...props} isAdmin={this.state.isAdmin} />;
  }

  renderArtistMergePage(props) {
    if (!this.state.isAdmin) {
      return <Redirect to="/404" />;
    }
    return <ArtistMergePage {...props} isAdmin={this.state.isAdmin} />;
  }

  renderArtistUnmerge(props) {
    if (!this.state.isAdmin) {
      return <Redirect to="/404" />;
    }
    return <ArtistUnmerge {...props} isAdmin={this.state.isAdmin} />;
  }

  render() {

    // if (!this.state.loaded) return <Loading fullPage={true} label={'Loading...'} />;
    // if (!this.state.user) return <FirebaseSignIn />;

    return (
      <HashRouter>
        <Switch>
          <Route exact path="/" render={this.renderHomePage} />
          <Route exact path="/spotify/sync" render={this.renderSpotifySyncPage} />
          <Route exact path="/spotify/login" render={this.renderSpotifyLogin} />
          <Route path="/:access_token(access_token=.*)" render={this.renderSpotifyLogin} />
          <Route exact path="/album/create" render={this.renderCreateAlbumPage} />
          <Route exact path="/artist/:id" render={this.renderArtistPage} />
          <Route exact path="/artist/:id/merge" render={this.renderArtistMergePage} />
          <Route exact path="/artist/:id/unmerge" render={this.renderArtistUnmerge} />
          <Route exact path="/404" component={PageNotFound} />
          <Route component={PageNotFound} />
        </Switch>
      </HashRouter>
    );
  }
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
);
