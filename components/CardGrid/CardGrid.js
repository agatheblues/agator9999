import React from 'react';
import PropTypes from 'prop-types';
import Card from '../Card/Card.js';
require('./CardGrid.scss');

class CardGrid extends React.Component {

  constructor(props) {
    super();
  }

  renderCards() {
    return this.props.cards.map((card, index) => {
      return(
        <Card key={index} name={card.name} imgUrl={card.imgUrl} />
      );
    });
  }

  render() {
    return (
      <div className='grid-container'>
        {this.renderCards()}
      </div>
    );
  }
};

CardGrid.propTypes = {
  cards: PropTypes.array.isRequired
};

export default CardGrid;
