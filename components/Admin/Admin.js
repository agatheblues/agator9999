import React from 'react';
import PropTypes from 'prop-types';
require('./Admin.scss');

class Admin extends React.Component {

  constructor() {
    super();

    this.handleConfirmClick = this.handleConfirmClick.bind(this);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleString();
  }

  handleConfirmClick(e) {
    e.preventDefault();
    const id = e.target.id;
    this.props.confirmUser(id);
  }

  renderUser(id, username, email, role, confirmedAt) {
    return (
      <tr key={id}>
        <td>{id}</td>
        <td>{username}</td>
        <td>{email}</td>
        <td>{role}</td>
        <td>{confirmedAt == null ? null : this.formatDate(confirmedAt)}</td>
        <td>
          {confirmedAt == null &&
            <a href='' id={id} onClick={this.handleConfirmClick}>{'\u{02713}'}&nbsp;Confirm</a>
          }
        </td>
      </tr>
    );
  }

  renderUsers(users) {
    return users.map(({ id, username, email, role, confirmed_at }) => this.renderUser(id, username, email, role, confirmed_at))
  }

  render() {
    const { users } = this.props;

    return (
      <div>
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
        <p className='note'>A user cannot login until an admin has confirmed the user.</p>
      </div>
    );
  }
}

Admin.propTypes = {
  users: PropTypes.array.isRequired,
  confirmUser: PropTypes.func.isRequired
};


export default Admin;
