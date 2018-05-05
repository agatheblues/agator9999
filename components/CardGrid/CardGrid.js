import React from 'react';
import PropTypes from 'prop-types';
import Card from '../Card/Card.js';
require('./CardGrid.scss');

class CardGrid extends React.Component {

  constructor(props) {
    super();
  }

  renderCards() {
    if ((this.props.cards.length != 0) && this.props.loaded) {
      return (
        <div className='grid-container'>
          {
            this.props.cards.map((card, index) => {
              return(
                <div key={index} >
                  <Card id={card.id} name={card.name} imgUrl={card.imgUrl} totalAlbums={Object.keys(card.albums).length}/>
                </div>
              );
            })
          }
        </div>
      );
    }

    if ((this.props.cards.length == 0) && this.props.loaded) {
      return (<p className='cardgrid-message'>Oops! There is 0 artist in your library.</p>);
    }

    if (!this.props.loaded) {
      return (<p className='cardgrid-message'>Loading your library...</p>);
    }
  }

  renderCounts() {
    return <p>{`${this.props.cards.length} artists, ${this.props.albumCount} albums`}</p>;
  }

  render() {
    return (
      <div>
        <div className='title-container title--marginlr'>
          <h1 className='title'>Artists</h1>
          {this.renderCounts()}
        </div>

        {this.renderCards()}
      </div>
    );
  }
};

CardGrid.propTypes = {
  cards: PropTypes.array.isRequired,
  loaded: PropTypes.bool.isRequired,
  albumCount: PropTypes.number.isRequired
};

export default CardGrid;
