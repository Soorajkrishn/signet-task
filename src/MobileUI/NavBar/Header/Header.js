import React from "react";
import { useThemeUpdate } from "../../../Context/MenuContext";
import './Header.css'

function Mobileheader(){

    const toggleMenu = useThemeUpdate();
    return(
        <div className="d-flex align-items-center justify-content-between headerWrapper header">
        <img
          src={process.env.REACT_APP_PUBLIC_URL + 'images/header/menu.svg'}
          aria-hidden="true"
          alt=""
          onClick={toggleMenu}
        />
        <h3>Ticket</h3>
        </div>
    )
}

export default Mobileheader