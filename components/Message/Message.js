import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
require('./Message.scss');


const Message = function ({message, error, style}) {

  if (style && (style == 'input-msg')) {
    return (
      <div className='msg-input-error-container'>
        <p className='msg-input-error'>{message}</p>
      </div>
    );
  }

  const messageClass = classNames({
    'msg': true,
    'msg--success': !{error}.error,
    'msg--error': {error}.error
  });

  return (
    <p className={messageClass}>{message}</p>
  );

};

Message.propTypes = {
  message: PropTypes.string,
  error: PropTypes.bool.isRequired,
  style: PropTypes.string
};

export default Message;
