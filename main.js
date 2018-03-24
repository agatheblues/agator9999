import React from 'react';
import ReactDOM from 'react-dom';
import SpotifyLogin from './components/SpotifyLogin/SpotifyLogin';
import Card from './components/Card/Card.js';
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
        <Card name='Coucou coucou' imgUrl='https://i.scdn.co/image/2210b7d23f320a2cab2736bd3b3b948415dd21d8'/>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
