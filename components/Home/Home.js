import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import CardGrid from '../../components/CardGrid/CardGrid';
import ProfileCard from '../../components/ProfileCard/ProfileCard';

class Home extends React.Component {
  constructor(props){
    super();

    this.handleClickLogout = this.handleClickLogout.bind(this);
  }

  handleClickLogout(e) {
    e.preventDefault();
    this.props.logout();
  }

  renderAdminMenu() {
    if (this.props.isAdmin) {
      return (
        <nav>
          <ul className='menu-wrapper'>
            <li><Link to='/spotify/sync'>Sync. Spotify Albums &#8635;</Link></li>
            <li><Link to='/album/create'>New album &#xFF0B;</Link></li>
          </ul>
        </nav>
      );
    }

    return null;
  }

  render() {
    return (
      <div className='content-container'>
        <div>
          <div className='menu-container'>
            <ProfileCard
              imgUrl={this.props.user.photoURL}
              name={this.props.user.displayName}
              handleClick={this.handleClickLogout}
            />
            {this.renderAdminMenu()}
          </div>
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
