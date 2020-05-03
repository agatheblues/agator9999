import React from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from '../helpers/ApiHelper';
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
      updateUser: this.updateUser.bind(this)
    };
  }

  getUsers() {
    getUsers()
      .then(({ data }) => this.handleGetUsersSuccess(data))
      .catch(() => this.handleGetUsersError())
  }

  updateUser(user) {
    updateArtist(user.id, {})
      .then(({ data }) => this.handleUpdateUserSuccess(data))
      .catch(() => this.handleUpdateUserError())
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

  handleUpdateUserSuccess(user) {
    console.log('success!')
    // this.setState({
    //   users: users
    // });
  }

  componentDidMount() {
    this.getUsers();
  }

  render() {
    const { users, loaded, error, message } = this.state;

    if (!loaded) return <Loading fullPage={true} label={'Loading users...'} />;

    if (error) {
      return (
        <div className='content-container'>
          <Message message={message} error={error} />
        </div>
      );
    }

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
        <Admin users={users} />
      </div>
    );
  }
}

export default AdminPage;
