import React from 'react';
import ReactDOM from 'react-dom';
import SpotifyLogin from './components/SpotifyLogin/SpotifyLogin';
import CardGrid from './components/CardGrid/CardGrid.js';
import firebase from 'firebase';
import config from './config.json';

class App extends React.Component {
  constructor(props){
    super(props);
    this.coucou = [{'name': 'test', 'imgUrl': 'https://i.scdn.co/image/609153aca7f4760136d97fbaccdb4ec0757e4c9e'},
      {'name': 'test', 'imgUrl': 'https://i.scdn.co/image/609153aca7f4760136d97fbaccdb4ec0757e4c9e'},
      {'name': 'test', 'imgUrl': 'https://i.scdn.co/image/609153aca7f4760136d97fbaccdb4ec0757e4c9e'},
      {'name': 'test', 'imgUrl': 'https://i.scdn.co/image/609153aca7f4760136d97fbaccdb4ec0757e4c9e'},
      {'name': 'test', 'imgUrl': 'https://i.scdn.co/image/609153aca7f4760136d97fbaccdb4ec0757e4c9e'},
      {'name': 'test', 'imgUrl': 'https://i.scdn.co/image/609153aca7f4760136d97fbaccdb4ec0757e4c9e'},
      {'name': 'test', 'imgUrl': 'https://i.scdn.co/image/609153aca7f4760136d97fbaccdb4ec0757e4c9e'},
      {'name': 'test', 'imgUrl': 'https://i.scdn.co/image/609153aca7f4760136d97fbaccdb4ec0757e4c9e'},
      {'name': 'test', 'imgUrl': 'https://i.scdn.co/image/609153aca7f4760136d97fbaccdb4ec0757e4c9e'}];

    firebase.initializeApp(config);
  }

  render() {
    return (
      <div>
        <SpotifyLogin db={firebase} />
        <CardGrid cards={this.coucou}/>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
