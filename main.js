import React from 'react';
import ReactDOM from 'react-dom';
import SpotifyLogin from './components/SpotifyLogin/SpotifyLogin';
import firebase from 'firebase';
import config from './config.json';

class App extends React.Component {
  constructor(props){
    super(props);

    firebase.initializeApp(config);
  }

  render() {
    return (
      <div>
        <SpotifyLogin db={firebase} />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
