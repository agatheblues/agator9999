import React from 'react';
import ReactDOM from 'react-dom';
import SpotifyLogin from './components/SpotifyLogin/SpotifyLogin';

class App extends React.Component {
  render() {
    return (
      <div>
        <SpotifyLogin />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
