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
                  <Card name={card.name} imgUrl={card.imgUrl} />
                  <p>{Object.keys(card.albums).length}</p>
                </div>
              );
            })
          }
        </div>
      );
    }

    if ((this.props.cards.length == 0) && this.props.loaded) {
      return (<p>Oops! You have nothing in your library.</p>);
    }

    if (!this.props.loaded) {
      return (<p>Loading your library...</p>);
    }
  }

  render() {
    return this.renderCards();
  }
};

CardGrid.propTypes = {
  cards: PropTypes.array.isRequired,
  loaded: PropTypes.bool.isRequired
};

export default CardGrid;
