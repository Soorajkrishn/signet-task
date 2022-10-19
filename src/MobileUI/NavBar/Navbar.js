import React from 'react';
import Mobileheader from './Header/Header';
import MoblieSidebar from './Sidebar/Sidebar';
import { ThemeProvider } from '../../Context/MenuContext';
import './Navbar.css';
import { Col, Row } from 'react-bootstrap';

function Navigation(component) {
  return (
    <ThemeProvider>
      <Mobileheader />
      <Row className="wrapper">
        <Col md={2} className="wrapper ">
          <MoblieSidebar />
        </Col>
        <Col md={10} className="wrapper">
          {component}
        </Col>
      </Row>
    </ThemeProvider>
  );
}

export default Navigation;
