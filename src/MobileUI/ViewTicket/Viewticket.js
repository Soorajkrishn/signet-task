import React, { useEffect, useState } from 'react';
import Navigation from '../NavBar/Navbar';
import useAnalyticsEventTracker from '../../Hooks/useAnalyticsEventTracker';
import { httpStatusCode } from '../../Constants/TextConstants';
import { useParams } from 'react-router-dom';
import { makeRequest } from '../../Services/APIService';
import APIUrlConstants from '../../Config/APIUrlConstants';

export default function Viewticket() {
  const { id } = useParams();
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const { buttonTracker } = useAnalyticsEventTracker();

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
      <Navigation />
      <p>
        <b>Ticket No : </b>
      </p>
      <p>
        <b>Description </b>
      </p>
      <p>
        <b>Status </b>
      </p>
      <p>
        <b>Problem Code</b>
      </p>
      <p>
        <b>Created Date</b>
      </p>
      <p>
        <b>Priority</b>
      </p>
      <p>
        <b>Created By</b>
      </p>
    </>
  );
}
