import React from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import CardGrid from '../components/CardGrid/CardGrid';
import ProfileCard from '../components/ProfileCard/ProfileCard';

class HomePage extends React.Component {
  constructor() {
    super();

    this.handleClickLogout = this.handleClickLogout.bind(this);
  }

  handleClickLogout(logout) {
    return (e) => {
      e.preventDefault();
      logout();
    }
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

  render() {
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
        <CardGrid />
      </div>
    );
  }
}

export default HomePage;
