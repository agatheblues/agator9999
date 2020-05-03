import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import Message from '../Message/Message';
require('./Admin.scss');

class Admin extends React.Component {

  constructor() {
    super();

    this.state = {
      error: false,
      message: null
    };
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleString();
  }

  handleSubmit(e) {
    e.preventDefault();

    // this.props.updateUser(this.props.artist, data);
  }

  handleDeleteClick() {

  }

  renderUser(id, username, email, role, confirmedAt) {
    return (
      <tr key={id}>
        <td>{id}</td>
        <td>{username}</td>
        <td>{email}</td>
        <td>{role}</td>
        <td>{confirmedAt == null ? 'unconfirmed' : this.formatDate(confirmedAt)}</td>
        <td>
          <a href='' className='unmerge-button' id={id} onClick={this.handleDeleteClick}>{'\u{2A2F}'}</a>
        </td>
      </tr>
    );
  }

  renderUsers(users) {
    console.log(users)
    return users.map(({ id, username, email, role, confirmed_at }) => this.renderUser(id, username, email, role, confirmed_at))
  }

  render() {
    const { users } = this.props;
    const { message, error } = this.state;

    return (
      <div className='form-container'>
        <table className='table-container'>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Confirmed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.renderUsers(users)}
          </tbody>
        </table>
        {message && <Message message={message} error={error} />}
        <p className='note'>A user cannot login until an admin has confirmed the user.</p>
      </div>
    );
  }
}

Admin.propTypes = {
  users: PropTypes.array.isRequired,
  // updateArtist: PropTypes.func.isRequired
};


export default Admin;
