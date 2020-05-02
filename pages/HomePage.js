import React from 'react';
import { Link } from 'react-router-dom';
import { getArtists } from '../helpers/ApiHelper';
import { UserContext } from '../context/UserContext';
import CardGrid from '../components/CardGrid/CardGrid';
import ProfileCard from '../components/ProfileCard/ProfileCard';
import Message from '../components/Message/Message';
import Loading from '../components/Loading/Loading';

class HomePage extends React.Component {
  constructor() {
    super();

    this.state = {
      artists: [],
      totalArtists: 0,
      totalAlbums: 0,
      loaded: false,
      error: false
    };

    this.handleClickLogout = this.handleClickLogout.bind(this);
  }

  handleClickLogout(logout) {
    return (e) => {
      e.preventDefault();
      logout();
    }
  }

  getArtistsList() {
    getArtists()
      .then((response) => this.handleSuccess(response))
      .catch(() => this.handleError());
  }

  handleSuccess(response) {
    const { data: { artists, total_albums, total_artists } } = response;

    this.setState({
      artists: artists,
      totalArtists: total_artists,
      totalAlbums: total_albums,
      loaded: true,
      error: false
    });
  }

  handleError() {
    this.setState({
      loaded: true,
      error: true
    });
  }

  renderAdminMenu() {
    return (
      <nav>
        <ul className='menu-wrapper'>
          <li><Link to='/spotify/sync'>&#8635; Sync. Spotify Albums</Link></li>
          <li><Link to='/album/create'>&#xFF0B; New album</Link></li>
        </ul>
      </nav>
    );
  }

  componentDidMount() {
    this.getArtistsList();
  }

  render() {
    const { loaded, error, artists, totalAlbums, totalArtists } = this.state;

    return (
      <div className='content-container'>
        <UserContext.Consumer>
          {({ user, admin, logout }) =>
            <div className='menu-container'>
              <ProfileCard
                imgUrl={user.imgUrl}
                name={user.username}
                handleClick={this.handleClickLogout(logout)}
              />
              {admin && this.renderAdminMenu()}
            </div>
          }
        </UserContext.Consumer>
        {!loaded && !error && <Loading fullPage={false} label={'Loading artists...'} />}
        {loaded && error && <Message message='Oops! Something went wrong while loading your library' error={error} />}
        {loaded && !error && <CardGrid artists={artists} totalAlbums={totalAlbums} totalArtists={totalArtists} />}
      </div>
    );
  }
}

export default HomePage;
