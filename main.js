import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import { UserContext } from './context/UserContext';
import { getUser, resetInstance } from './helpers/ApiHelper';
import ArtistPage from './pages/ArtistPage';
import ArtistMergePage from './pages/ArtistMergePage';
import ArtistUnmergePage from './pages/ArtistUnmergePage';
import CreateAlbumPage from './pages/CreateAlbumPage';
import SpotifySyncPage from './pages/SpotifySyncPage';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import Loading from './components/Loading/Loading';
import PageNotFound from './components/PageNotFound/PageNotFound';
import SpotifyLogin from './components/SpotifyLogin/SpotifyLogin';

require('./main.scss');

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      admin: true,
      loaded: false,
      logout: this.logout.bind(this)
    };

    this.login = this.login.bind(this);
    this.renderPage = this.renderPage.bind(this);
    this.getUser = this.getUser.bind(this);
  }

  getUser() {
    this.setState({
      loaded: false
    }, () =>
      getUser()
        .then(({ data }) => this.handleGetUserSuccess(data))
        .catch((error) => this.handleGetUserError(error))
    );
  }

  handleGetUserSuccess(data) {
    const { username, role } = data;

    this.setState({
      loaded: true,
      user: {
        username: username,
        imgUrl: 'https://placekitten.com/300/300'
      },
      admin: role === 'admin'
    });
  }

  handleGetUserError() {
    this.setState({
      loaded: true
    });
  }

  login(token) {
    localStorage.setItem("token", token);
    resetInstance();
    this.getUser();
  }

  logout() {
    localStorage.removeItem("token");
    resetInstance();
    this.setState({
      user: null
    });
  }

  componentDidMount() {
    this.getUser();
  }

  renderPage(Page, adminPage = true) {
    return (props) => {
      const { admin } = this.state;
      if (adminPage && !admin) return <Redirect to="/404" />;

      return (
        <UserContext.Provider value={this.state}>
          <Page {...props} />
        </UserContext.Provider>
      );
    }
  }

  render() {
    if (!this.state.loaded) return <Loading fullPage={true} label={'Loading...'} />;
    if (!this.state.user) return <AuthPage login={this.login} />;

    return (
      <HashRouter>
        <Switch>
          <Route exact path="/" render={this.renderPage(HomePage, false)} />
          <Route exact path="/spotify/sync" render={this.renderPage(SpotifySyncPage)} />
          <Route exact path="/spotify/login" render={this.renderPage(SpotifyLogin)} />
          <Route path="/:access_token(access_token=.*)" render={this.renderPage(SpotifyLogin)} />
          <Route exact path="/album/create" render={this.renderPage(CreateAlbumPage)} />
          <Route exact path="/artist/:id" render={this.renderPage(ArtistPage, false)} />
          <Route exact path="/artist/:id/merge" render={this.renderPage(ArtistMergePage)} />
          <Route exact path="/artist/:id/unmerge" render={this.renderPage(ArtistUnmergePage)} />
          <Route exact path="/admin" render={this.renderPage(AdminPage)} />
          <Route exact path="/404" component={PageNotFound} />
          <Route path="*" component={PageNotFound} />
        </Switch>
      </HashRouter >
    );
  }
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
);
