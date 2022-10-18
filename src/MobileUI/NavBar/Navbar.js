import React from 'react';
import Mobileheader from './Header/Header';
import MoblieSidebar from './Sidebar/Sidebar';
import { ThemeProvider } from '../../Context/MenuContext';
import './Navbar.css';

function Navigation(component) {
  return (
    <ThemeProvider>
      <Mobileheader />
      <MoblieSidebar />
      {component}
    </ThemeProvider>
  );
}

export default Navigation;
