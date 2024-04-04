import React from 'react';
import logo from '../img/logo.gif'
import './Navbar.css'

const Navbar = () => {
  return (
    <nav className='navbar'>
      <a className='logo'>
        <img className='logo-gif' src={logo} alt="Logo" />
        Groveify
      </a>
      {/* Add navigation links here */}
    </nav>
  );
};

export default Navbar;
