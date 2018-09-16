import React from 'react';
import PropTypes from 'prop-types';
import * as fb from '../../helpers/FirebaseHelper';
import Loading from '../Loading/Loading';

class ArtistMerge extends React.Component {

  constructor(props) {
    super();
  }


  render() {
    return <p>COUCOU</p>;
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
