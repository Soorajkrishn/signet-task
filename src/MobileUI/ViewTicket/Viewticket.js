import React, { useEffect, useState } from 'react';
import Navigation from '../NavBar/Navbar';
import { httpStatusCode } from '../../Constants/TextConstants';
import { useParams } from 'react-router-dom';
import { makeRequest } from '../../Services/APIService';
import APIUrlConstants from '../../Config/APIUrlConstants';
import Loading from '../../Pages/Widgets/Loading';

export default function Viewticket() {
  const { id } = useParams();
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState({});

  const fetchTicketDetails = async () => {
    setLoading(true);
    const { 0: statusCode, 1: resp } = await makeRequest(`${APIUrlConstants.VIEW_TICKET}/${id}`);
    if (statusCode === httpStatusCode.SUCCESS) {
      setLoading(false);
      setData(resp.data[0]);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, []);
  return (
    <>
      {isLoading && <Loading />}
      {!isLoading ? (
        <>
          <Navigation />
          <div className="container">
            <p>
              <b>Ticket No :</b>
              {data.ticketNo}
            </p>
            <div>
              <label>
                <b>Description </b>
              </label>
              <p>{data.description}</p>
              <label>
                <b>Status </b>
              </label>
              <p>{data.status}</p>
              <label>
                <b>Problem Code</b>
              </label>
              <p>{data.problem}</p>
              <label>
                <b>Created Date</b>
              </label>
              <p>{data.createdDate}</p>
              <label>
                <b>Priority</b>
              </label>
              <p>{data.priority}</p>
              <label>
                <b>Created By</b>
              </label>
              <p>{data.createdBy}</p>
              <label>
                <b>Caller Email</b>
              </label>
              <p>{data.callerEmail}</p>
              <label>
                <b>Phone Number</b>
              </label>
              <p>{data.phoneNumber}</p>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
