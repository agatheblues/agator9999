import React from 'react';
import ReactDOM from 'react-dom';
// import { init, getUser, getFbSignOut, getAuth } from './helpers/FirebaseHelper.js';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import { UserContext } from './context/UserContext';
import ArtistPage from './pages/ArtistPage';
import ArtistMergePage from './pages/ArtistMergePage';
import ArtistUnmergePage from './pages/ArtistUnmergePage';
import CreateAlbumPage from './pages/CreateAlbumPage';
import SpotifySyncPage from './pages/SpotifySyncPage';
import HomePage from './pages/HomePage';
import SignIn from './components/SignIn/SignIn';
import Loading from './components/Loading/Loading';
import PageNotFound from './components/PageNotFound/PageNotFound';
import SpotifyLogin from './components/SpotifyLogin/SpotifyLogin';

require('./main.scss');

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {
        photoURL: 'https://placekitten.com/300/300',
        displayName: 'Prout',
        role: 'user'
      },
      // user: null,
      admin: true,
      loaded: false
    };

    this.setUserToState = this.setUserToState.bind(this);
    // this.logout = this.logout.bind(this);
    this.renderPage = this.renderPage.bind(this);
  }

  setUserToState(user) {
    this.setState({
      user,
      loaded: true,
      admin: user.role === 'admin'
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

  renderPage(Page, adminPage = true) {
    return (props) => (
      <UserContext.Consumer>
        {({ user, admin }) => {
          if (adminPage && !admin) return <Redirect to="/404" />;
          return <Page {...props} user={user} admin={admin} />;
        }}
      </UserContext.Consumer>
    )
  }

  render() {

    // if (!this.state.loaded) return <Loading fullPage={true} label={'Loading...'} />;
    if (!this.state.user) return <SignIn />;

    return (
      <HashRouter>
        <Switch>
          <UserContext.Provider value={this.state}>
            <Route exact path="/" render={this.renderPage(HomePage, false)} />
            <Route exact path="/spotify/sync" render={this.renderPage(SpotifySyncPage)} />
            <Route exact path="/spotify/login" render={this.renderPage(SpotifyLogin)} />
            <Route path="/:access_token(access_token=.*)" render={this.renderPage(SpotifyLogin)} />
            <Route exact path="/album/create" render={this.renderPage(CreateAlbumPage)} />
            <Route exact path="/artist/:id" render={this.renderPage(ArtistPage, false)} />
            <Route exact path="/artist/:id/merge" render={this.renderPage(ArtistMergePage)} />
            <Route exact path="/artist/:id/unmerge" render={this.renderPage(ArtistUnmergePage)} />
            <Route exact path="/404" component={PageNotFound} />
            <Route component={PageNotFound} />
          </UserContext.Provider>
        </Switch>
      </HashRouter>
    );
  }
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
);
