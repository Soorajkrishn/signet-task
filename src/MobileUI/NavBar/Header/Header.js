import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme, useThemeUpdate } from '../../../Context/MenuContext';
import { editprofile, profileIcon } from '../../../Redux/Actions/Actions';
import './Header.css';
import { userRoleId } from '../../../Utilities/AppUtilities';

function Mobileheader() {
  const [ticketEdit, setTicketEdit] = useState(false);
  const navigate = useNavigate();
  const toggleMenu = useThemeUpdate();
  const dispatch = useDispatch();
  const location = useLocation();
  const sidebarOpen = useTheme();
  const userProfile = useSelector((state) => state.MoblieuiReducer);
  const { email } = userProfile;
  const { id } = userProfile;
  const { profile } = userProfile;

  const edit = () => {
    if (location.pathname === '/mobprofile') {
      dispatch(editprofile('Edit Profile'));
    } else {
      dispatch(editprofile('Edit Ticket'));
      navigate(`/mobadd/${id}`);
    }
  };

  useEffect(()=>{
    if(localStorage.getItem('roleId')===userRoleId.signetAdmin){
      dispatch(profileIcon('Users'))
    }else{
      dispatch(profileIcon('Tickets'))
    }
  },[])
  useEffect(() => {
    if (email === localStorage.getItem('email')) {
      setTicketEdit(true);
    } else if (profile) {
      setTicketEdit(true);
    } else {
      setTicketEdit(false);
    }
  }, [userProfile]);

  return (
    <div className="d-flex  justify-content-between headerWrapper ">
      <div className="align-items-start">
        {sidebarOpen ? (
          <img alt="" src="/images/tasks/x-mark.svg" onClick={toggleMenu} />
        ) : (
          <img src={process.env.REACT_APP_PUBLIC_URL + 'images/header/menu.svg'} aria-hidden="true" alt="" onClick={toggleMenu} />
        )}
      </div>
      <div className="align-items-center">
        <h3>{userProfile?.pageName}</h3>
      </div>
      <div className="align-items-end">
        {ticketEdit ? <img onClick={() => edit()} alt="" src="/images/tasks/edit.svg" /> : <img alt="" />}
      </div>
    </div>
  );
}

export default Mobileheader;
