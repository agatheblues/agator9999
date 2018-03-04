import React from 'react';
import ReactDOM from 'react-dom';
import SpotifyLogin from './components/SpotifyLogin/SpotifyLogin';

class App extends React.Component {

  // fires before component is mounted
  constructor(props) {

    // makes this refer to this component
    super(props);
  }

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
