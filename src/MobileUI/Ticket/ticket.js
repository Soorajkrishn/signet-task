import React, { useEffect, useState } from 'react';
import { gaEvents, httpStatusCode } from '../../Constants/TextConstants';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { makeRequest } from '../../Services/APIService';
import Loading from '../../Pages/Widgets/Loading';
import Navbar from '../NavBar/Navbar';
import './ticket.css';

function TicketList() {
  const [ticket, setTicket] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [sliceTicket, setSliceTicket] = useState([]);

  const fetchAllUserDetails = async () => {
    setLoading(true);
    const { 0: statusCode, 1: data } = await makeRequest(
      APIUrlConstants.TICKETS_LIST + `?customerNo=${localStorage.getItem('orgNo')}`,
    );
    if (statusCode === httpStatusCode.SUCCESS) {
      setTicket(data.data);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAllUserDetails();
  }, []);

  window.onscroll = () => {
    console.log('hi');
  };

  useEffect(() => {
    if (ticket.length > 15) {
      const tempTicket = ticket?.slice(0, 15);
      setSliceTicket(tempTicket);
    } else {
      setSliceTicket(ticket);
    }
  }, []);

  return (
    <div className="container">
      {isLoading && <Loading />}
      <Navbar />
      <ul>
        {sliceTicket.map((v) => (
          <li className="ticketData">
            <p className="truncate">{v.description}</p>
            <p>{v.ticketNo}</p>
          </li>
        ))}
      </ul>

      <div className="addTicket">
        <img src="/images/tasks/plus.svg" alt="" />
      </div>
    </div>
  );
}

export default TicketList;
