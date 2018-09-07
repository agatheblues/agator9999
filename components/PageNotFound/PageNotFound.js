import React from 'react';
import { Link } from 'react-router-dom';
require('./PageNotFound.scss');

const PageNotFound = function() {
  return (
    <div className='content-container'>
      <div className='back-to-library'>
        <Link to='/'>&#9839; Back to library</Link>
      </div>
      <h1 className='title'>Oops! This page does not exists.</h1>
    </div>
  );
};


export default PageNotFound;
