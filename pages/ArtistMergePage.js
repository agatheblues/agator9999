import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getArtists, mergeArtists } from '../helpers/ApiHelper';
import { ArtistMergeContext } from '../context/ArtistMergeContext';
import Loading from '../components/Loading/Loading';
import PageNotFound from '../components/PageNotFound/PageNotFound';
import ArtistMerge from '../components/ArtistMerge/ArtistMerge';
import Message from '../components/Message/Message';

class ArtistMergePage extends React.Component {
  constructor() {
    super();

    this.state = {
      originArtist: {},
      error: false,
      message: null,
      artists: [],
      loaded: false,
      mergeArtists: this.mergeArtists.bind(this)
    };
  }

  getArtists(id) {
    getArtists()
      .then(({ data }) => this.handleGetArtistsSuccess(data.artists, id))
      .catch(() => this.handleGetArtistsError())
  }

  mergeArtists(originArtist, artistToMergeWith) {
    mergeArtists(originArtist.id, artistToMergeWith.id)
      .then(() => this.getArtists(this.props.match.params.id))
      .catch(() => this.handleMergeArtistsError())
  }

  handleGetArtistsError() {
    this.setState({
      error: true,
      loaded: true,
      message: 'Oops! Something went wrong while retrieving the list of artists.'
    });
  }

  handleGetArtistsSuccess(artists, id) {
    const originArtist = artists.find((artist) => artist.id == id);
    const eligibleArtists = artists.filter((artist) => artist.id != id);

    this.setState({
      artists: eligibleArtists,
      originArtist: originArtist,
      loaded: true
    });
  }

  handleMergeArtistsError() {
    this.setState({
      error: true,
      loaded: true,
      message: 'Oops! Something went wrong while merging the artists.'
    });
  }

  componentDidMount() {
    this.getArtists(this.props.match.params.id);
  }

  render() {
    const { originArtist, artists, loaded, error, message } = this.state;

    if (!loaded) return <Loading fullPage={true} label={'Loading available artists to merge with...'} />;

    if (!originArtist) return <PageNotFound />;

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
        <h2>Merge artists</h2>
        <ArtistMergeContext.Provider value={this.state}>
          <ArtistMerge originArtist={originArtist} artists={artists} />
        </ArtistMergeContext.Provider>
      </div>
    );
  }
}

ArtistMergePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.node,
    }).isRequired,
  }).isRequired
};

export default ArtistMergePage;
