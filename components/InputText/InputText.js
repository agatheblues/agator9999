import React from 'react';
import classNames from 'classnames';
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
    const { id, placeholder, value, invert, type } = this.props;

    const classes = classNames({
      'form-input-text': true,
      'form-input-text--inverted': invert
    });

    return (
      <div className='input-container'>
        <input
          type={type}
          spellCheck='false'
          value={value || ''}
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          className={classes}
          placeholder={placeholder}
          id={id}
        />
      </div>
    );
  }

}

InputText.defaultProps = {
  placeholder: null,
  handleError: null,
  handleFocus: null,
  id: null,
  value: null,
  invert: false,
  type: 'text'
}

InputText.propTypes = {
  placeholder: PropTypes.string,
  handleValue: PropTypes.func.isRequired,
  handleError: PropTypes.func,
  handleFocus: PropTypes.func,
  id: PropTypes.string,
  value: PropTypes.string,
  invert: PropTypes.bool,
  type: PropTypes.string,
};

export default InputText;
