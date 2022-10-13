import React, { useEffect, useState } from 'react';
import { apiMethods, gaEvents, httpStatusCode } from '../../Constants/TextConstants';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { fetchCall, makeRequest } from '../../Services/APIService';
import Loading from '../../Pages/Widgets/Loading';
import Navbar from '../NavBar/Navbar';
import './ticket.css';
import { useNavigate } from 'react-router-dom';
import useAnalyticsEventTracker from '../../Hooks/useAnalyticsEventTracker';
import { Button, Modal, Form, Alert } from 'react-bootstrap';

function TicketList() {
  const [ticket, setTicket] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [sliceTicket, setSliceTicket] = useState([]);
  const [page, setPage] = useState(1);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(10);
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const { buttonTracker } = useAnalyticsEventTracker();
  const [show, setShow] = useState(false);

  const [ticketNo, setTicketNo] = useState(null);

  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState(false);
  const closeAlert = () => setShowAlert(false);
  const [alertMessage, setAlertMessage] = useState('');

  const fetchAllUserDetails = async () => {
    setLoading(true);
    const { 0: statusCode, 1: data } = await makeRequest(
      APIUrlConstants.TICKETS_LIST + `?customerNo=${localStorage.getItem('orgNo')}`,
    );
    if (statusCode === httpStatusCode.SUCCESS) {
      setTicket(data.data);
      setLoading(false);
    } else {
      setShowAlert(true);
      setError(true);
      setAlertMessage(data?.message || 'Failed to fetch tickets');
      setLoading(false);
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
    }
  };
  useEffect(() => {
    fetchAllUserDetails();
  }, []);

  const pageNo = Math.ceil(ticket.length / 10);

  const view = () => {
    setTimeout(() => {
      if (page <= pageNo) {
        setPage(page + 1);
        setStart(start + 10);
        setEnd(end + 10);
        const tempSlice = ticket?.slice(start, end);
        const temp = sliceTicket.concat(tempSlice);
        setSliceTicket(temp);
        setLoader(false);
      }
    }, 1500);
  };

  window.onscroll = () => {
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 2) {
      if (page <= pageNo) {
        setLoader(true);
        view();
      }
    }
  };

  useEffect(() => {
    if (ticket.length > 10) {
      const tempTicket = ticket?.slice(start, end);
      setSliceTicket(tempTicket);
    } else {
      setSliceTicket(ticket);
    }
  }, [ticket]);

  const handleClick = (id) => {
    navigate(`/mobview/${id}`);
  };

  return (
    <>
      <div className="container">
        {isLoading && <Loading />}
        <Navbar />
        <ul>
          {sliceTicket.map((v) => (
            <li onClick={() => handleClick(v.ticketNo)} className="ticketData">
              <p className="truncate">{v.description}</p>
              <p>{v.ticketNo}</p>
            </li>
          ))}
        </ul>
        {loader && <Loading />}
        <div
          className="addTicket"
          onClick={() => {
            navigate('/mobadd');
          }}
        >
          <img src="/images/tasks/plus.svg" alt="" />
        </div>
      </div>
      {showAlert && (
        <Alert variant={!error ? 'success' : 'danger'} className="alertWrapper" onClose={closeAlert} dismissible>
          <Alert.Heading>{alertMessage}</Alert.Heading>
        </Alert>
      )}
    </>
  );
}

export default TicketList;
