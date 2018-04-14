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
      albumtData: {}
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
    return (
      <div>
        <p>Yo</p>
      </div>
    );
  }
};

AlbumOverview.propTypes = {
  id: PropTypes.string.isRequired
};

export default AlbumOverview;
