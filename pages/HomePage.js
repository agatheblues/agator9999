import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { getArtists, getAlbums } from '../helpers/ApiHelper';
import { UserContext } from '../context/UserContext';
import CardGrid from '../components/CardGrid/CardGrid';
import ProfileCard from '../components/ProfileCard/ProfileCard';
import Message from '../components/Message/Message';
import Loading from '../components/Loading/Loading';

class HomePage extends React.Component {
  constructor() {
    super();

    this.state = {
      resources: [
        {
          name: 'artists',
          active: true,
          loaded: false,
          fetch: this.getArtistsList.bind(this),
          items: [],
        },
        {
          name: 'albums',
          active: false,
          loaded: false,
          fetch: this.getAlbumsList.bind(this),
          items: [],
        }
      ],
      totalArtists: 0,
      totalAlbums: 0,
      error: false
    };

    this.handleClickLogout = this.handleClickLogout.bind(this);
  }

  updateActiveResource(name) {
    return this.state.resources.map((resource) => {
      resource.active = (resource.name === name);
      return resource;
    });
  }

  showResource(name) {
    return (e) => {
      e.preventDefault();
      const resource = this.state.resources.find((r) => r.name === name);

      if (!resource.loaded) {
        this.setState({
          resources: this.updateActiveResource(name)
        }, () => resource.fetch());
      } else {
        this.setState({
          resources: this.updateActiveResource(name)
        })
      }
    }
  }

  getArtistsList() {
    getArtists()
      .then(({ data }) => this.handleSuccess(data, 'artists'))
      .catch(() => this.handleError('artists'));
  }

  getAlbumsList() {
    getAlbums()
      .then(({ data }) => this.handleSuccess(data, 'albums'))
      .catch(() => this.handleError('albums'));
  }

  handleClickLogout(logout) {
    return (e) => {
      e.preventDefault();
      logout();
    }
  }

  handleSuccess(data, name) {
    const resources = this.state.resources.map((resource) => {
      if (resource.name === name) {
        resource.items = data[name];
        resource.loaded = true;
        resource.active = true;
      } else {
        resource.active = false;
      }
      return resource;
    })

    this.setState({
      resources: resources,
      error: false,
      totalAlbums: data.total_albums,
      totalArtists: data.total_artists,
    });
  }

  handleError(name) {
    const resources = this.state.resources.map((resource) => {
      resource.loaded = resource.name === name;
      return resource;
    })
    this.setState({
      resources: resources,
      error: true
    });
  }

  renderAdminMenu() {
    return (
      <nav>
        <ul className='menu-wrapper'>
          <li><Link to='/admin'>&#9872; Administrate</Link></li>
          <li><Link to='/spotify/sync'>&#8635; Sync. Spotify Albums</Link></li>
          <li><Link to='/album/create'>&#xFF0B; New album</Link></li>
        </ul>
      </nav>
    );
  }

  renderGrid(resources, totalAlbums, totalArtists, error) {
    const activeResource = resources.find((r) => r.active);
    const inactiveResources = resources.filter((r) => !r.active);
    const { name, loaded, items } = activeResource;
    const total = name === 'artists' ? totalArtists : totalAlbums;

    return (
      <Fragment>
        <div className='title-container'>
          <h1 className='title capitalize'>{name}</h1>
          {inactiveResources.map(resource =>
            <a
              href=''
              key={resource.name}
              className='capitalize'
              onClick={this.showResource(resource.name)}>
              {resource.name}
            </a>
          )}
        </div>
        {!loaded && !error && <Loading fullPage={false} label={`Loading ${name}...`} />}
        {loaded && error && <Message message='Oops! Something went wrong while loading your library' error={error} />}
        {loaded && !error && <CardGrid key={name} items={items} resource={name} total={total} />}
      </Fragment>
    );
  }

  componentDidMount() {
    const activeResource = this.state.resources.find((r) => r.active);
    activeResource.fetch();
  }

  render() {
    const { error, totalAlbums, totalArtists, resources } = this.state;

    return (
      <div className='content-container'>
        <UserContext.Consumer>
          {({ user, admin, logout }) =>
            <div className='menu-container'>
              <ProfileCard
                imgUrl={user.imgUrl}
                name={user.username}
                handleClick={this.handleClickLogout(logout)}
                totalAlbums={totalAlbums}
                totalArtists={totalArtists}
              />
              {admin && this.renderAdminMenu()}
            </div>
          }
        </UserContext.Consumer>

        {this.renderGrid(resources, totalAlbums, totalArtists, error)}
      </div>
    );
  }
}

export default HomePage;
