import React from 'react';
import ReactDOM from 'react-dom';
import Button from './components/Button/Button';

class App extends React.Component {

  // fires before component is mounted
  constructor(props) {

    // makes this refer to this component
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    console.log('Click happened');
  }

  render() {
    return (
      <Button
        id={'Matthias'}
        label={'Matthias fdp'}
        handleClick={this.handleClick}
      />
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
