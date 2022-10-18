import React, { useEffect, useState } from 'react';
import { Nav } from 'react-bootstrap';
import APIUrlConstants from '../../../Config/APIUrlConstants';
import { apiMethods, gaEvents } from '../../../Constants/TextConstants';
import { useTheme } from '../../../Context/MenuContext';
import './Sidebar.css';
import { userRoleId } from '../../../Utilities/AppUtilities';
import { useOktaAuth } from '@okta/okta-react';
import { fetchCall } from '../../../Services/APIService';
import Loading from '../../../Pages/Widgets/Loading';
import { useDispatch } from 'react-redux';
import { profile, profileIcon } from '../../../Redux/Actions/Actions';
import { useNavigate } from 'react-router-dom';

function MoblieSidebar() {
  const { oktaAuth } = useOktaAuth();
  const sidebarOpen = useTheme();
  const organizationName = localStorage.getItem('orgName');
  const [user, seruser] = useState([]);
  const [unSeenNotification, setUnseenNotification] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const role = localStorage.getItem('roleId');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const newNotification = unSeenNotification.length;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    seruser(userData);
  }, []);

  const fetchNotifications = async () => {
    const [statusCode, response] = await fetchCall(APIUrlConstants.LIST_NOTIFICATIONS, apiMethods.POST, {
      userId: localStorage.getItem('id'),
      orgName: organizationName,
    });
    if (statusCode === 200) {
      const ids = [];
      setUnseenNotification(response.data.unSeenList);
      response.data.unSeenList.length > 0 && response.data.unSeenList.map((item) => ids.push(item.id));
      ids.length > 0 &&
        (await fetchCall(APIUrlConstants.REMOVE_NOTIFICATIONS, apiMethods.POST, {
          userId: localStorage.getItem('id'),
          notificationIds: ids,
        }));
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const Logout = async () => {
    setIsLoading(true);
    const urlencoded = new URLSearchParams();
    urlencoded.append('userId', localStorage.getItem('id'));
    urlencoded.append('isSocial', localStorage.getItem('isSocial'));
    const [statusCode, response] = await fetchCall(APIUrlConstants.LOGOUT_API, apiMethods.POST, urlencoded);
    if (statusCode === 200) {
      oktaAuth.tokenManager.clear();
      localStorage.clear();
      window.fcWidget.destroy();
      window.location.href = '/';
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className={'sidebarBox ' + (sidebarOpen ? 'showSidebar' : 'hideSidebar')}>
      {isLoading && <Loading />}
      <div className="flex-column d-flex align-items-center bgColor">
        <div>
          <img alt="fd" src="/images/tasks/logo192.png" />
        </div>
        <div>
          <h6>
            {user?.firstName} {user?.lastName}
          </h6>
          <h6>{user?.emailId}</h6>
        </div>
      </div>
      <div className="sideWrap">
        <Nav className="flex-column d-flex">
          {role === userRoleId.remoteSmartUser && (
            <>
              <Nav.Link
                className="pe-0 ps-2"
                onClick={() => {
                  dispatch(profileIcon('Ticket'));
                  navigate('/mobticket');
                }}
              >
                <img alt="" src="/images/tasks/ticket.svg" className="mr-2" />
                Ticket
              </Nav.Link>
              <Nav.Link
                className="pe-0 ps-2"
                onClick={() => {
                  dispatch(profileIcon('Dashboard'));
                  navigate('/mobdashboard');
                }}
              >
                <img alt="" src="/images/tasks/dashboard.svg" className="mr-2" />
                Dashboard
              </Nav.Link>
              <Nav.Link
                className="pe-0 ps-2"
                onClick={() => {
                  dispatch(profileIcon('Notification'));
                  navigate('/mobnoti');
                }}
              >
                <img alt="" src="/images/tasks/notification.svg" className="mr-2" />
                Notification{' '}
                <span className="ml-5">
                  <b>{newNotification}</b>
                </span>
              </Nav.Link>

              <Nav.Link
                className="pe-0 ps-2"
                onClick={() => {
                  dispatch(profile('Profile'));
                  navigate('/mobprofile');
                }}
              >
                <img alt="" src="/images/tasks/profile.svg" className="mr-2" />
                Profile
              </Nav.Link>
            </>
          )}
          {role === userRoleId.nonRemoteSmartUser && (
            <>
              <Nav.Link className="pe-0 ps-2">
                onClick=
                {() => {
                  dispatch(profileIcon('Ticket'));
                  navigate('/mobticket');
                }}
                <img alt="" src="/images/tasks/ticket.svg" className="mr-2" />
                Ticket
              </Nav.Link>
              <Nav.Link
                className="pe-0 ps-2"
                onClick={() => {
                  dispatch(profileIcon('Dashboard'));
                  navigate('/mobdashboard');
                }}
              >
                <img alt="" src="/images/tasks/dashboard.svg" className="mr-2" />
                Dashboard
              </Nav.Link>
              <Nav.Link
                className="pe-0 ps-2"
                onClick={() => {
                  dispatch(profileIcon('Notification'));
                  navigate('/mobnoti');
                }}
              >
                <img alt="" src="/images/tasks/notification.svg" className="mr-2" />
                Notification{' '}
                <span className="ml-5">
                  <b>{newNotification}</b>
                </span>
              </Nav.Link>

              <Nav.Link
                className="pe-0 ps-2"
                onClick={() => {
                  dispatch(profile('Profile'));
                  navigate('/mobprofile');
                }}
              >
                <img alt="" src="/images/tasks/profile.svg" className="mr-2" />
                Profile
              </Nav.Link>
            </>
          )}
          {role === userRoleId.signetAdmin && (
            <>
              <Nav.Link
                className="pe-0 ps-2"
                onClick={() => {
                  dispatch(profileIcon('Users'));
                  navigate('/mobusers');
                }}
              >
                <img alt="" src="/images/tasks/User.svg" className="mr-2" />
                Users
              </Nav.Link>

              <Nav.Link
                className="pe-0 ps-2"
                onClick={() => {
                  dispatch(profile('Profile'));
                  navigate('/mobprofile');
                }}
              >
                <img alt="" src="/images/tasks/profile.svg" className="mr-2" />
                Profile
              </Nav.Link>
            </>
          )}

          <Nav.Link onClick={() => Logout()} className="pe-0 ps-2">
            <img alt="" src="/images/tasks/logout.svg" className="mr-2" />
            Logout
          </Nav.Link>
        </Nav>
      </div>
    </div>
  );
}

export default MoblieSidebar;
