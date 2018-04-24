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
              console.log(card);
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

  render() {
    return (
      <div>
        <h1 className='title title--marginlr'>Artists</h1>
        {this.renderCards()}
      </div>
    );
  }
};

CardGrid.propTypes = {
  cards: PropTypes.array.isRequired,
  loaded: PropTypes.bool.isRequired
};

export default CardGrid;
