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
    this.handleFocus = this.handleFocus.bind(this);
  }


  handleFocus(event) {
    if (this.props.handleFocus) {
      this.props.handleFocus(this.state.value);
    }
  }

  handleChange(event) {
    let message = null;

    if (this.props.setErrorMessage) {
      message = this.props.setErrorMessage(event.target.value);
    }

    this.props.handleValue(event.target.value);

    this.setState({
      value: event.target.value,
      errorMessage: message
    });
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    if (nextProps.value != this.state.value) {
      this.setState({
        value: nextProps.value
      });
    }
  }

  render() {
    console.log('input text', this.state);
    return (
      <div className='input-container'>
        <input
          type='text'
          spellCheck='false'
          value={this.state.value}
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          className='form-input-text'
          placeholder={this.props.placeholder}
          id={this.props.id}
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
  setErrorMessage: PropTypes.func,
  handleValue: PropTypes.func.isRequired,
  handleFocus: PropTypes.func,
  id: PropTypes.string,
  value: PropTypes.string
};

export default InputText;
