import React from 'react';
import PropTypes from 'prop-types';
require('./InputText.scss');

class InputText extends React.Component {
  constructor(props) {
    super();

    this.state= {
      value: '',
      errorMessage: null
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const message = this.props.setErrorMessage(event.target.value);

    this.setState({
      value: event.target.value,
      errorMessage: message
    });
  }

  render() {
    return (
      <div className='input-container'>
        <input
          type='text'
          spellCheck='false'
          value={this.state.value}
          onChange={this.handleChange}
          className='form-input-text'
          placeholder={this.props.placeholder}
        />
        {this.state.errorMessage &&
          <div className='input-error-container'>
            <p className='input-error'>{this.state.errorMessage}</p>
          </div>
        }
      </div>
    );
  }

}

InputText.propTypes = {
  placeholder: PropTypes.string,
  setErrorMessage: PropTypes.func
};

export default InputText;
