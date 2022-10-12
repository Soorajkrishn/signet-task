import React, { useEffect, useState } from 'react';
import { fetchCall } from '../../Services/APIService';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { apiMethods, httpStatusCode } from '../../Constants/TextConstants';
import { Button } from 'react-bootstrap';
import Loading from '../../Pages/Widgets/Loading';
import Navigation from '../NavBar/Navbar';
import './Notification.css';

export default function Notification() {
  const organizationName = localStorage.getItem('orgName');
  const [notifications, setNotifications] = useState([]);
  const [lastPage, setLastPage] = useState(false);
  const [firstPage, setFirstPage] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPage, setTotalPage] = useState(firstPage);

  const fetchNotifications = async (pageNo) => {
    setIsLoading(true);
    const [statusCode, response] = await fetchCall(APIUrlConstants.VIEW_ALL_NOTIFICATIONS, apiMethods.POST, {
      userId: localStorage.getItem('id'),
      orgName: organizationName,
      page: pageNo,
      pageSize: 5,
      status: 'All',
    });
    if (statusCode === httpStatusCode.SUCCESS) {
      setIsLoading(false);
      setNotifications(response.data.content);
      setLastPage(response.data.last);
      setFirstPage(response.data.first);
      setTotalPage(response.data.totalPages);
      setPageNumber(pageNo);
    } else {
      setIsLoading(false);
    }
  };
  const newPage = firstPage + 1;

  console.log(lastPage);

  useEffect(() => {
    fetchNotifications(0);
  }, []);
  console.log(notifications);
  const next = () => {
    const nextPageNumber = pageNumber + 1;
    fetchNotifications(nextPageNumber);
  };

  const previous = () => {
    const previousPageNumber = pageNumber - 1;
    fetchNotifications(previousPageNumber);
  };

  const notificationPage = () => {
    if (newPage <= totalPage) {
      const temp = notifications.concat(notifications);
      setNotifications(temp);
      next();
    }
  };

  window.onscroll = () => {
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 2) {
      notificationPage();
    }
  };
  return (
    <>
      <Navigation />
      <div className="wrapperBase">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="notifyBodyWrap">
            {notifications.map((i) => (
              <div className="notifyBodyBox" key={i.id}>
                <span />
                <div className="notifyBodyInfo">
                  <div dangerouslySetInnerHTML={{ __html: i.notificationMessage }} />
                </div>
              </div>
            ))}
            <div className="pagination">
              <Button className="saveBtn paginationButton" disabled={firstPage} onClick={() => previous()}>
                {'<'}
              </Button>
              <Button className="saveBtn paginationButton" disabled={lastPage} onClick={() => next()}>
                {'>'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
