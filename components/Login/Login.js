import React from 'react';
import PropTypes from 'prop-types';
import InputText from '../InputText/InputText';
import Button from '../Button/Button';
import Message from '../Message/Message';
require('./Login.scss');

class Login extends React.Component {

  constructor() {
    super();

    this.state = {
      email: '',
      password: '',
      errorEmail: false,
      errorPassword: false,
      messageEmail: null,
      messagePassword: null
    }

    this.passwordRegex = /(?=.*[0-9])/;
    this.emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleErrorEmail = this.handleErrorEmail.bind(this);
    this.handleErrorPassword = this.handleErrorPassword.bind(this);
    this.handleValueFor = this.handleValueFor.bind(this);
  }

  validateEmail(email) {
    let errors = [];

    if (email.length === 0) {
      errors.push('Email is required.');
    }
    if (!this.emailRegex.test(email)) {
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
    // if (!this.passwordRegex.test(password)) {
    //   errors.push('Password should contain at least one number.');
    // }
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

  handleErrorEmail() {
    const errors = this.validateEmail(this.state.email);
    this.handleInputErrors(errors, 'Email');
    return errors;
  }

  handleErrorPassword() {
    const errors = this.validatePassword(this.state.password);
    this.handleInputErrors(errors, 'Password');
    return errors;
  }

  hasErrors() {
    const { email, password } = this.state;
    const errors = this.handleErrorEmail(email).concat(this.handleErrorPassword(password));

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

    this.props.handleLogin(this.state.email, this.state.password);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div className='form-row-container'>
          <InputText
            placeholder={'Email'}
            handleValue={this.handleValueFor('email')}
            // handleError={this.handleErrorEmail}
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
            // handleError={this.handleErrorPassword}
            value={this.state.password}
            invert={true}
            type={'password'}
          />
        </div>
        <Message message={this.state.messagePassword} error={this.state.errorPassword} style={'input-msg-invert'} />

        <div className='submit-container'>
          <Button label='Login' handleClick={this.handleSubmit} invert={true} />
        </div>
      </form>
    );
  }
}

Login.propTypes = {
  handleLogin: PropTypes.func.isRequired
};

export default Login;
