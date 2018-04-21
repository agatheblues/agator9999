import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import CreateAlbumSpotify from '../CreateAlbumSpotify/CreateAlbumSpotify';
require('./CreateAlbum.scss');

class CreateAlbum extends React.Component {

  constructor(props) {
    super();
    this.state = {
      source: 'spotify'
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    this.setState({
      source: e.target.id
    });
  };

  renderForm() {
    switch (this.state.source) {
    case 'spotify':
      return <CreateAlbumSpotify />;
      break;
    case 'bandcamp':
      return <p>Soon...</p>;
      break;
    default:
      return <p>Oops! This platform does not exist :(</p>;
    }
  }

  render() {
    return (
      <div className='content-container'>
        <div className='back-to-library'>
          <Link to='/'>&#9839; Back to library</Link>
        </div>
        <h2>Add an album</h2>
        <nav>
          <ul onClick={this.handleClick}>
            <li id='spotify' className={this.state.source == 'spotify' ? 'active' : ''}>From Spotify</li>
            <li id='bandcamp' className={this.state.source == 'bandcamp' ? 'active' : ''}>From Bandcamp</li>
          </ul>
        </nav>

        <div className='form-container'>
          {this.renderForm()}
        </div>
      </div>
    );
  }
}


export default CreateAlbum;