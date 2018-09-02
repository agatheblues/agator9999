import React from 'react';
import PropTypes from 'prop-types';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase';
import {init} from '../../helpers/FirebaseHelper.js';
import { config } from '../../config';
require('./FirebaseSignIn.scss');

class FirebaseSignIn extends React.Component {

  constructor(props) {
    super();

    init();

    // Configure FirebaseUI.
    this.uiConfig = {
      // Popup signin flow rather than redirect flow.
      signInFlow: 'popup',
      // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
      signInSuccessUrl: '/signedIn',
      // We will display Google and Facebook as auth providers.
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ],
      callbacks: {
        signInSuccessWithAuthResult : () => {
          return false;
        }
      }
    };

  }

  render() {
    return (
      <div className='signin-wrapper'>
        <div className='signin-container'>
          <div className='signin-content'>
            <h1>Welcome to {`${config.owner}`}&#39;s music library.</h1>
            <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()}/>
            <p className='note note--light'>agator9999 is an open-source personal music library aggregator built with React + Firebase. Check it out on <a className='inverted' href='https://github.com/agatheblues/agator9999'>Github</a> and start your own library!</p>
          </div>
        </div>
      </div>
    );
  }
}


export default FirebaseSignIn;
