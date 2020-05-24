import React from 'react';
import { Link } from 'react-router-dom';
import { getUsers, updateUser } from '../helpers/ApiHelper';
import Loading from '../components/Loading/Loading';
import Admin from '../components/Admin/Admin';
import Message from '../components/Message/Message';

class AdminPage extends React.Component {
  constructor() {
    super();

    this.state = {
      users: [],
      error: false,
      message: null,
      loaded: false,
    };

    this.confirmUser = this.confirmUser.bind(this);
  }

  getUsers() {
    getUsers()
      .then(({ data }) => this.handleGetUsersSuccess(data))
      .catch(() => this.handleGetUsersError())
  }

  confirmUser(id) {
    updateUser(id, { confirmed_at: new Date(Date.now()) })
      .then(() => getUsers())
      .then(({ data }) => this.handleUpdateUserSuccess(data))
      .catch(() => this.handleUpdateUserError(error))
  }

  handleGetUsersError() {
    this.setState({
      error: true,
      loaded: true,
      message: 'Oops! Something went wrong while retrieving the users.'
    });
  }

  handleGetUsersSuccess(data) {
    this.setState({
      users: data.users,
      loaded: true
    });
  }

  handleUpdateUserError() {
    this.setState({
      error: true,
      message: 'Oops! Something went wrong while updating the user.'
    });
  }

  handleUpdateUserSuccess(data) {
    this.setState({
      users: data.users,
      error: false,
      message: 'User updated.'
    });
  }

  componentDidMount() {
    this.getUsers();
  }

  render() {
    const { users, loaded, error, message } = this.state;

    if (!loaded) return <Loading fullPage={true} label={'Loading users...'} />;

    return (
      <div className='content-container'>
        <div className='back-to-library'>
          <Link to='/'>&#9839; Back to library</Link>
        </div>
        <h2>Administrate</h2>
        <nav>
          <ul>
            <li id='users' className={'active'}>Users</li>
          </ul>
        </nav>
        <div className='form-container'>
          <Admin users={users} confirmUser={this.confirmUser} />
          {message && <Message message={message} error={error} />}
        </div>
      </div>
    );
  }
}

export default AdminPage;
