import React from 'react';
import PropTypes from 'prop-types';
require('./ArtistSummary.scss');

class ArtistSummary extends React.Component {

  constructor(props) {
    super();
  }

  render() {
    return <p>Coucou {this.props.match.params.id}</p>;
  }
};

ArtistSummary.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.node,
    }).isRequired,
  }).isRequired
};

export default ArtistSummary;
