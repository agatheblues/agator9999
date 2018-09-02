import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
require('./Loading.scss');

const Loading = function({fullPage, label}) {

  const loadingClass = classNames({
    'loading-container': true,
    'loading-container--full': fullPage
  });

  return (
    <div className={loadingClass}>
      <div className='spinner'>
        <div className='rect1'></div>
        <div className='rect2'></div>
        <div className='rect3'></div>
        <div className='rect4'></div>
        <div className='rect5'></div>
        {label &&
          <p className='note'>{label}</p>
        }
      </div>
    </div>
  );
};

Loading.propTypes = {
  fullPage: PropTypes.bool.isRequired,
  label: PropTypes.string
};



export default Loading;
