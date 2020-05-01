import React from 'react';
import PropTypes from 'prop-types';
import { config } from '../config';
import { getToken, createUser } from '../helpers/ApiHelper';
import Login from '../components/Login/Login';
import SignUp from '../components/SignUp/SignUp';
import Message from '../components/Message/Message';

class AuthPage extends React.Component {
  constructor() {
    super();

    this.state = {
      error: false,
      message: null,
      showLogin: true,
    };

    this.getToken = this.getToken.bind(this);
    this.createUser = this.createUser.bind(this);
    this.showSignUp = this.showSignUp.bind(this);
    this.showLogin = this.showLogin.bind(this);
  }

  getToken(email, password) {
    getToken({
      auth: {
        email: email,
        password: password
      }
    })
      .then(({ data }) => this.handleSubmitSuccess(data))
      .catch((error) => this.handleSubmitError(error));
  }

  createUser(email, username, password) {
    createUser({
      username: username,
      email: email,
      password: password
    })
      .then(() => this.handleCreateUserSuccess())
      .catch((error) => this.handleCreateUserError(error));
  }

  handleSubmitError(error) {
    const response = error.response;
    if (response.status === 404) {
      this.setState({
        error: true,
        message: 'Email or password not matching.'
      });
    } else {
      this.setState({
        error: true,
        message: 'Something went wrong while logging in.'
      });
    }
  }

  handleSubmitSuccess(response) {
    const { jwt } = response;
    this.props.login(jwt);
  }

  showSignUp(e) {
    e.preventDefault();
    this.setState({
      showLogin: false
    });
  }

  showLogin(e) {
    e.preventDefault();
    this.setState({
      showLogin: true
    });
  }

  handleCreateUserSuccess() {
    this.setState({
      showLogin: true,
      message: 'Account created! Proceed with login.'
    });
  }

  handleCreateUserError() {
    this.setState({
      error: true,
      message: 'Something went wrong while creating the account.'
    })
  }

  render() {
    const { message, error, showLogin } = this.state;

    return (
      <div className='login-wrapper'>
        <div className='login-container'>
          <div className='login-content'>
            <h1>Welcome to {`${config.owner}`}&#39;s music library.</h1>
            <div className='login-form-container'>
              {showLogin && <Login handleLogin={this.getToken} showSignUp={this.showSignUp} />}
              {!showLogin && <SignUp handleSignUp={this.createUser} showLogin={this.showLogin} />}
              {message &&
                <Message message={message} error={error} />
              }
            </div>
            <p className='note note--light'>agator9999 is an open-source personal music library aggregator built with React + Rails. Check it out on <a className='inverted' href='https://github.com/agatheblues/agator9999'>Github</a> and start your own library!</p>
          </div>
        </div>
      </div>
    );
  }
}

AuthPage.propTypes = {
  login: PropTypes.func.isRequired
};

export default AuthPage;
