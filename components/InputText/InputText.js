import React from 'react';
import PropTypes from 'prop-types';
require('./InputText.scss');

class InputText extends React.Component {
  constructor(props) {
    super();

    this.handleChange = this.handleChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
  }

  handleFocus(event) {
    if (this.props.handleFocus) {
      this.props.handleFocus(event.target.value);
    }
  }

  handleChange(event) {
    this.props.handleValue(event.target.value);
    if (this.props.handleError) this.props.handleError(event.target.value);
  }

  render() {
    return (
      <div className='input-container'>
        <input
          type='text'
          spellCheck='false'
          value={this.props.value || ''}
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          className='form-input-text'
          placeholder={this.props.placeholder}
          id={this.props.id}
        />
      </div>
    );
  }

}

InputText.propTypes = {
  placeholder: PropTypes.string,
  handleValue: PropTypes.func.isRequired,
  handleError: PropTypes.func,
  handleFocus: PropTypes.func,
  id: PropTypes.string,
  value: PropTypes.string
};

export default InputText;
