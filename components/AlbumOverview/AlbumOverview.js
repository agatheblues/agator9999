import React from 'react';
import PropTypes from 'prop-types';
import Message from '../Message/Message.js';
import {getAlbum, getFbDb} from '../../DataWrapper/FirebaseDataWrapper.js';
require('./AlbumOverview.scss');

class AlbumOverview extends React.Component {

  constructor(props) {
    super();

    this.db = getFbDb();

    this.state = {
      error: false,
      message: null,
      hasAlbumData: false,
      albumData: {}
    };

    this.handleGetAlbumSuccess = this.handleGetAlbumSuccess.bind(this);
    this.handleGetAlbumError = this.handleGetAlbumError.bind(this);
  }

  handleGetAlbumSuccess(album) {
    this.setState({
      hasAlbumData: true,
      albumData: album
    });
  }

  handleGetAlbumError(message) {
    this.setState({
      'error': true,
      'message': message
    });
  }

  componentDidMount() {
    getAlbum(this.props.id, this.db, this.handleGetAlbumSuccess, this.handleGetAlbumError);
  }


  render() {
    console.log(this.state);
    return (
      <div className='card-container'>
        <div className='card-wrapper'>
          <p>{this.state.albumData.name}</p>
          <p>{this.state.albumData.added_at}</p>
          <p>{this.state.albumData.source}</p>
          <p>{this.state.albumData.url}</p>
        </div>
      </div>
    );
  }
};

AlbumOverview.propTypes = {
  id: PropTypes.string.isRequired
};

export default AlbumOverview;
