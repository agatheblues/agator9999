import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as fb from '../../helpers/FirebaseHelper';
import Loading from '../Loading/Loading';
import Button from '../Button/Button';
import Message from '../Message/Message';
import Card from '../Card/Card';
require('./ArtistUnmerge.scss');

class ArtistUnmerge extends React.Component {

  constructor(props) {
    super();

    this.state = {
      artist: null,
      error: false,
      message: null,
      showForm: false,
      sources: null
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.resetDeleteSources = this.resetDeleteSources.bind(this);
  }

  handleGetOriginArtistSuccess(artist) {
    artist.id = this.props.match.params.id;

    if (artist.sources.hasOwnProperty('spotify') && artist.sources.hasOwnProperty('discogs')) {
      this.setState({
        originArtist: artist,
        sources: artist.sources,
        showForm: true
      });
    } else {
      this.setState({
        originArtist: artist,
        error: true,
        sources: artist.sources,
        message: 'Oops! This artist cannot be unmerged because it only has one source!',
        showForm: false
      });
    }
  }

  handleGetArtistError() {
    this.setState({
      error: true,
      message: 'Oops! Something went wrong while retrieving the artist.'
    });
  }

  handleDeleteClick(event) {
    event.preventDefault();
    const sources = fb.omit(event.target.id, this.state.sources);
    this.setState({ sources });
  }

  resetDeleteSources(event) {
    event.preventDefault();
    this.setState({ sources: this.state.originArtist.sources });
  }

  handleSuccessUnmerge() {
    this.setState({
      error: false,
      message: 'Unmerge of artist successful!',
      showForm: false
    });
  }

  handleErrorUnmerge() {
    this.setState({
      error: true,
      message: 'Oops! Something went wrong while merging artists.'
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    if (!this.state.showForm) return;
    if (Object.keys(this.state.sources).length == Object.keys(this.state.originArtist.sources).length) {
      this.setState({
        error: true,
        message: 'Please delete a source first!'
      });
      return;
    }

    fb.unmergeArtist(this.state.originArtist.id, this.state.sources)
      .then(() => this.handleSuccessUnmerge())
      .catch((error) => this.handleErrorUnmerge(error));
  }

  componentDidMount() {
    fb.getArtist(this.props.match.params.id)
      .then((snapshot) => this.handleGetOriginArtistSuccess(snapshot.val()))
      .catch((error) => this.handleGetArtistError());
  }

  renderCard() {
    if (!this.state.originArtist) return;

    return (
      <Card
        id={this.props.match.params.id}
        name={this.state.originArtist.name}
        imgUrl={this.state.originArtist.imgUrl}
        totalAlbums={Object.keys(this.state.originArtist.albums).length}
      />
    );
  }

  renderDeleteButton(key) {
    const hasOnlyOneSource = (Object.keys(this.state.sources).length == 1);
    if (hasOnlyOneSource) return null;
    return <a href='' className='unmerge-button' id={key} onClick={this.handleDeleteClick}>{'\u{2A2F}'}</a>;
  }

  renderSources() {
    if (!this.state.sources) return;

    return (
      <div className='sources-container'>
        <h3>Artist sources:</h3>
        <ul className='vertical-list'>
          {
            Object.keys(this.state.sources).map((key) => {
              let url = '';
              if (key == 'discogs') url = 'https://api.discogs.com/artists/' + this.state.sources[key];
              if (key == 'spotify') url = 'https://open.spotify.com/go?uri=spotify:artist:' + this.state.sources[key];

              return (
                <li key={key} className='sources-list-item'>
                  <div>
                    <span className='capitalize'>{key}: </span>
                    <a href={url} target='_blank' rel='noopener noreferrer'>{this.state.sources[key]}</a>
                  </div>
                  { this.renderDeleteButton(key)}
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }

  renderForm() {
    return (
      <div>
        { this.state.message &&
            <Message message={this.state.message} error={this.state.error}/>
        }

        { this.state.showForm &&
          <div className='submit-container'>
            <a href='' className='link-button' onClick={this.resetDeleteSources}>Cancel</a>
            <Button label='OK' handleClick={this.handleSubmit}/>
          </div>
        }
      </div>
    );
  }

  render() {
    return (
      <div className='content-container'>
        <div className='back-to-library'>
          <Link to='/'>&#9839; Back to library</Link>
        </div>
        <h2>Unmerge artist</h2>

        <div className='form-container'>
          <form onSubmit={this.handleSubmit}>
            <div className='form-row-container form-row--space-center'>
              { this.renderCard() }
              { this.renderSources() }
            </div>
            { this.renderForm() }
            <p className='note'>To unmerge an artist means removing a source from this artist. The albums will stay attached to the artist even if you remove a source. An artist should have at least one source.</p>
          </form>
        </div>
      </div>
    );
  }
}

ArtistUnmerge.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.node,
    }).isRequired,
  }).isRequired,
  isAdmin: PropTypes.bool.isRequired
};

export default ArtistUnmerge;
