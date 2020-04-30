import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import CardGrid from '../components/CardGrid/CardGrid';
import ProfileCard from '../components/ProfileCard/ProfileCard';

class HomePage extends React.Component {
  constructor() {
    super();

    this.handleClickLogout = this.handleClickLogout.bind(this);
  }

  handleClickLogout(e) {
    e.preventDefault();
    this.props.logout();
  }

  renderAdminMenu(admin) {
    if (!admin) return null;
    return (
      <nav>
        <ul className='menu-wrapper'>
          <li><Link to='/spotify/sync'>&#8635; Sync. Spotify Albums</Link></li>
          <li><Link to='/album/create'>&#xFF0B; New album</Link></li>
        </ul>
      </nav>
    );
  }

  render() {
    const { user: { imgUrl, username }, admin } = this.props;

    return (
      <div className='content-container'>
        <div>
          <div className='menu-container'>
            <ProfileCard
              imgUrl={imgUrl}
              name={username}
              handleClick={this.handleClickLogout}
            />
            {this.renderAdminMenu(admin)}
          </div>
          <CardGrid />
        </div>
      </div>
    );
  }
}

HomePage.propTypes = {
  user: PropTypes.object.isRequired,
  admin: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired
};

export default HomePage;
