import React from 'react';
import PropTypes from 'prop-types';
import InputText from '../InputText/InputText';
import Button from '../Button/Button';
import Message from '../Message/Message';
import { passwordRegex, emailRegex, usernameRegex } from '../../helpers/utils';
require('./SignUp.scss');

class SignUp extends React.Component {

  constructor() {
    super();

    this.state = {
      email: '',
      password: '',
      username: '',
      errorEmail: false,
      errorPassword: false,
      errorUsername: false,
      messageEmail: null,
      messagePassword: null,
      messageUsername: null
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleValueFor = this.handleValueFor.bind(this);
  }

  validate(field) {
    switch (field) {
      case 'email':
        return this.validateEmail(this.state.email);
      case 'password':
        return this.validatePassword(this.state.password);
      case 'username':
        return this.validateUsername(this.state.username);
      default:
        return;
    }
  }

  validateEmail(email) {
    let errors = [];

    if (email.length === 0) {
      errors.push('Email is required.');
    }
    if (!emailRegex.test(email)) {
      errors.push('Email is invalid.');
    }

    return errors;
  }

  validatePassword(password) {
    let errors = [];

    if (password.length === 0) {
      errors.push('Password is required.');
    }
    if (password.length < 8) {
      errors.push('Password should have more than 8 characters.');
    }
    if (!passwordRegex.test(password)) {
      errors.push('Password should contain at least one number.');
    }
    return errors;
  }

  validateUsername(username) {
    let errors = [];

    if (username.length === 0) {
      errors.push('Username is required.');
    }
    if (!usernameRegex.test(username)) {
      errors.push('Username can only contain alphanumeric characters.');
    }

    return errors;
  }

  handleInputErrors(errors, field) {
    if (errors.length > 0) {
      this.setState({
        [`error${field}`]: true,
        [`message${field}`]: errors.join(' '),
      });
    } else {
      this.setState({
        [`error${field}`]: false,
        [`message${field}`]: null,
      });
    }
  }

  handleError(field) {
    const errors = this.validate(field.toLowerCase());
    this.handleInputErrors(errors, field);
    return errors;
  }

  hasErrors() {
    const errors = this.handleError('Email').concat(this.handleError('Password')).concat(this.handleError('Username'));
    return errors.length > 0;
  }

  /**
   * Returns a function that handle value changes of forms inputs
   * @param  {String} label input label
   * @return {function}     handler for the given input
   */
  handleValueFor(label) {
    return (value) => {
      this.setState({
        [label]: value
      });
    };
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.hasErrors()) return;

    this.setState({
      error: false,
      message: null
    });

    this.props.handleSignUp(this.state.email, this.state.username, this.state.password);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div className='form-row-container'>
          <InputText
            placeholder={'Username'}
            handleValue={this.handleValueFor('username')}
            handleError={() => this.handleError('Username')}
            value={this.state.username}
            invert={true}
            type={'text'}
          />
        </div>
        <Message message={this.state.messageUsername} error={this.state.errorUsername} style={'input-msg-invert'} />

        <div className='form-row-container'>
          <InputText
            placeholder={'Email'}
            handleValue={this.handleValueFor('email')}
            handleError={() => this.handleError('Email')}
            value={this.state.email}
            invert={true}
            type={'email'}
          />
        </div>
        <Message message={this.state.messageEmail} error={this.state.errorEmail} style={'input-msg-invert'} />

        <div className='form-row-container'>
          <InputText
            placeholder={'Password'}
            handleValue={this.handleValueFor('password')}
            handleError={() => this.handleError('Password')}
            value={this.state.password}
            invert={true}
            type={'password'}
          />
        </div>
        <Message message={this.state.messagePassword} error={this.state.errorPassword} style={'input-msg-invert'} />

        <div className='submit-container'>
          <a href='' className='link-button link-button--inverted' onClick={this.props.showLogin}>Login</a>
          <Button label='SignUp' handleClick={this.handleSubmit} invert={true} />
        </div>
      </form>
    );
  }
}

SignUp.propTypes = {
  handleSignUp: PropTypes.func.isRequired,
  showLogin: PropTypes.func.isRequired
};

export default SignUp;
