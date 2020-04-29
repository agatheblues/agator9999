import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getArtist, updateArtist } from '../helpers/ApiHelper';
import { ArtistUnmergeContext } from '../context/ArtistUnmergeContext';
import Loading from '../components/Loading/Loading';
import PageNotFound from '../components/PageNotFound/PageNotFound';
import ArtistUnmerge from '../components/ArtistUnmerge/ArtistUnmerge';
import Message from '../components/Message/Message';

class ArtistUnmergePage extends React.Component {
  constructor() {
    super();

    this.state = {
      artist: {},
      error: false,
      message: null,
      loaded: false,
      updateArtist: this.updateArtist.bind(this)
    };
  }

  getArtist(id) {
    getArtist(id)
      .then(({ data }) => this.handleGetArtistSuccess(data))
      .catch(() => this.handleGetArtistError())
  }

  updateArtist(artist, data) {
    updateArtist(artist.id, data)
      .then(({ data }) => this.handleUnmergeArtistSuccess(data))
      .catch(() => this.handleUnmergeArtistError())
  }

  handleGetArtistError() {
    this.setState({
      error: true,
      loaded: true,
      message: 'Oops! Something went wrong while retrieving the artist.'
    });
  }

  handleGetArtistSuccess(artist) {
    this.setState({
      artist: artist,
      loaded: true
    });
  }

  handleUnmergeArtistError() {
    this.setState({
      error: true,
      loaded: true,
      message: 'Oops! Something went wrong while unmerging the artist.'
    });
  }

  handleUnmergeArtistSuccess(artist) {
    this.setState({
      artist: artist
    });
  }

  componentDidMount() {
    this.getArtist(this.props.match.params.id);
  }

  render() {
    const { artist, loaded, error, message } = this.state;

    if (!loaded) return <Loading fullPage={true} label={'Loading artist...'} />;

    if (!artist) return <PageNotFound />;

    if (error) {
      return (
        <div className='content-container'>
          <Message message={message} error={error} />
        </div>
      );
    }

    return (
      <div className='content-container'>
        <div className='back-to-library'>
          <Link to='/'>&#9839; Back to library</Link>
        </div>
        <h2>Unmerge artist</h2>
        <ArtistUnmergeContext.Provider value={this.state}>
          <ArtistUnmerge isAdmin={this.props.isAdmin} artist={artist} />
        </ArtistUnmergeContext.Provider>
      </div>
    );
  }
}

ArtistUnmergePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.node,
    }).isRequired,
  }).isRequired,
  isAdmin: PropTypes.bool.isRequired
};

export default ArtistUnmergePage;
