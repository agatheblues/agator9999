import React from 'react';
import PropTypes from 'prop-types';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase';
import {init} from '../../helpers/FirebaseHelper.js';

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
          const user = firebase.auth().currentUser;
          console.log('sign in', user);
          return false;
        }
      }
    };

  }

  render() {
    return (
      <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()}/>
    );
  }
}


export default FirebaseSignIn;
