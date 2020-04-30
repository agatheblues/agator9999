import React from 'react';
import PropTypes from 'prop-types';
import { config } from '../config';
import { getToken } from '../helpers/ApiHelper';
import Login from '../components/Login/Login';
import Message from '../components/Message/Message';

class AuthPage extends React.Component {
  constructor() {
    super();

    this.state = {
      error: false,
      message: null
    };

    this.login = this.login.bind(this);
  }

  login(email, password) {
    getToken({
      auth: {
        email: email,
        password: password
      }
    })
      .then(({ data }) => this.handleSubmitSuccess(data))
      .catch((error) => this.handleSubmitError(error))
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
    localStorage.setItem("token", jwt);
    this.props.loginCallback();
  }

  render() {
    return (
      <div className='login-wrapper'>
        <div className='login-container'>
          <div className='login-content'>
            <h1>Welcome to {`${config.owner}`}&#39;s music library.</h1>
            <div className='login-form-container'>
              <Login handleLogin={this.login} />
              {this.state.message &&
                <Message message={this.state.message} error={this.state.error} />
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
  loginCallback: PropTypes.func.isRequired
};

export default AuthPage;
