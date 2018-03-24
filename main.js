import React from 'react';
import ReactDOM from 'react-dom';
import SpotifyLogin from './components/SpotifyLogin/SpotifyLogin';
import CardGrid from './components/CardGrid/CardGrid.js';
import firebase from 'firebase';
import config from './config.json';
import * as fb from './DataWrapper/FirebaseDataWrapper.js';

class App extends React.Component {
  constructor(props){
    super(props);

    firebase.initializeApp(config);
    this.db = firebase.database();

    this.state = {
      artists: []
    };

    this.handleGetArtists = this.handleGetArtists.bind(this);
  }

  handleGetArtists(artists) {
    this.setState({
      artists: artists
    });
  }

  componentDidMount() {
    fb.getArtists(this.db, this.handleGetArtists);
  }

  render() {
    return (
      <div>
        <SpotifyLogin db={this.db} />
        <CardGrid cards={this.state.artists}/>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
