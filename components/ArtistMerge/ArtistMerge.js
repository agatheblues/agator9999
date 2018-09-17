import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as fb from '../../helpers/FirebaseHelper';
import Loading from '../Loading/Loading';
import Button from '../Button/Button';
import Message from '../Message/Message';
import Card from '../Card/Card';
import SearchDropdown from '../SearchDropdown/SearchDropdown';
import classNames from 'classnames';
require('./ArtistMerge.scss');

class ArtistMerge extends React.Component {

  constructor(props) {
    super();

    this.state = {
      originArtist: null,
      artistToMergeWith: null,
      error: false,
      message: null,
      artists: []
    };

    this.handleSelectedArtist = this.handleSelectedArtist.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleGetOriginArtistSuccess(artist, hasMerged) {
    if (!hasMerged) {
      artist.id = this.props.match.params.id;
      this.setState({
        originArtist: artist
      });
    }

    this.setState({
      error: false,
      message: 'Merge was successful!',
      artistToMergeWith: null,
      originArtist: artist
    });

  }

  handleGetArtistError() {
    this.setState({
      error: true,
      message: 'Oops! Something went wrong while retrieving the artist.'
    });
  }

  checkIfHasNotSource(arrayOfSources, source) {
    return (arrayOfSources.indexOf(source) == -1);
  }

  handleGetArtistsSuccess(artists) {
    const mergeSource = Object.keys(this.state.originArtist.sources)[0];
    const filteredArtistsBySource = artists.filter((artist) => !artist.sources.hasOwnProperty(mergeSource));

    this.setState({
      artists: filteredArtistsBySource
    });
  }

  handleGetArtistToMergeWithSuccess(artist, artistId) {
    artist.id = artistId;

    this.setState({
      artistToMergeWith: artist
    });
  }

  handleGetArtistsError() {
    this.setState({
      error: true,
      message: 'Oops! Something went wrong while retrieving your list of artists.'
    });
  }

  handleSuccessMerge() {
    fb.getArtist(this.props.match.params.id)
      .then((snapshot) => this.handleGetOriginArtistSuccess(snapshot.val(), true))
      .catch((error) => this.handleGetArtistError());
  }

  handleErrorMerge() {
    this.setState({
      error: true,
      message: 'Oops! Something went wrong while merging artists.'
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    fb.mergeArtists(this.state.originArtist.id, this.state.artistToMergeWith)
      .then(() => fb.removeArtist(this.state.artistToMergeWith.id))
      .then(() => this.handleSuccessMerge())
      .catch((error) => this.handleErrorMerge(error));
  }

  handleSelectedArtist(artistId) {
    fb.getArtist(artistId)
      .then((snapshot) => this.handleGetArtistToMergeWithSuccess(snapshot.val(), artistId))
      .catch((error) => this.handleGetArtistError());
  }

  componentDidMount() {
    fb.getArtist(this.props.match.params.id)
      .then((snapshot) => this.handleGetOriginArtistSuccess(snapshot.val()))
      .then(() => fb.getArtists()
        .then((data) => this.handleGetArtistsSuccess(fb.formatArtistList(data)))
        .catch((error) => this.handleGetArtistsError())
      )
      .catch((error) => this.handleGetArtistError());
  }

  render() {
    const cardClass = classNames({
      'form-row-container form-row--center': true,
      'form-row--space-between': this.state.artistToMergeWith,
      'form-row--space-around': !this.state.artistToMergeWith
    });

    return (
      <div className='content-container'>
        <div className='back-to-library'>
          <Link to='/'>&#9839; Back to library</Link>
        </div>
        <h2>Merge artist</h2>

        <div className='form-container'>
          <form onSubmit={this.handleSubmit}>
            <div className={cardClass}>
              { this.state.originArtist &&
                <Card
                  id={this.props.match.params.id}
                  name={this.state.originArtist.name}
                  imgUrl={this.state.originArtist.imgUrl}
                  totalAlbums={Object.keys(this.state.originArtist.albums).length}
                  sources={this.state.originArtist.sources}
                />
              }
              { this.state.artistToMergeWith &&
                <p className='merge-plus'>+</p>
              }
              { this.state.artistToMergeWith &&
                <Card
                  id={this.state.artistToMergeWith.id}
                  name={this.state.artistToMergeWith.name}
                  imgUrl={this.state.artistToMergeWith.imgUrl}
                  totalAlbums={Object.keys(this.state.artistToMergeWith.albums).length}
                  sources={this.state.artistToMergeWith.sources}
                />
              }
            </div>

            <SearchDropdown
              list={this.state.artists}
              id={'id'}
              value={'name'}
              placeholder={'Find an artist to merge with'}
              handleValue={this.handleSelectedArtist}
            />

            { this.state.message &&
                <Message message={this.state.message} error={this.state.error}/>
            }

            <div className='submit-container'>
              <Button label='OK' handleClick={this.handleSubmit}/>
            </div>

            <p className='note'>You can only merge two artists with different sources. Merging two artists creates one artist with both sources combined, and all the albums will be stored under one artist.</p>
          </form>
        </div>
      </div>
    );
  }
}

ArtistMerge.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.node,
    }).isRequired,
  }).isRequired,
  isAdmin: PropTypes.bool.isRequired
};

export default ArtistMerge;
