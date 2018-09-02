import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import SpotifySync from '../../components/SpotifySync/SpotifySync';
import SpotifyLogin from '../../components/SpotifyLogin/SpotifyLogin';
import SpotifyProfile from '../../components/SpotifyProfile/SpotifyProfile';
import CardGrid from '../../components/CardGrid/CardGrid';
import CreateAlbum from '../../components/CreateAlbum/CreateAlbum';
import Artist from '../../components/Artist/Artist';
import Button from '../../components/Button/Button';


class Home extends React.Component {
  constructor(props){
    super(props);
  }


  render() {
    return (
      <div className='content-container'>
        <div>
          <div>
            <div className='user-profile'>
              <img src={this.props.user.photoURL} />
            </div>
            <Button
              id={'btn-fb-signout'}
              label={'Sign out'}
              handleClick={this.props.logout}
            />
          </div>

          {this.props.isAdmin &&
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
          }
          <CardGrid />
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  user: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired
};

export default Home;
