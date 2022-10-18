import React, { useEffect, useState } from 'react';
import { httpStatusCode } from '../../Constants/TextConstants';
import { useNavigate, useParams } from 'react-router-dom';
import { makeRequest } from '../../Services/APIService';
import APIUrlConstants from '../../Config/APIUrlConstants';
import Loading from '../../Pages/Widgets/Loading';
import './Viewticket.css';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { profileIcon } from '../../Redux/Actions/Actions';

export default function MobileViewticket() {
  const { id } = useParams();
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchTicketDetails = async () => {
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
          <div className="container mt-3">
            <p>
              <b>Ticket No :</b>
              {data?.ticketNo}
            </p>
            <div>
              <label>
                <b>Description </b>
              </label>
              <div className="textContainer">
                <p>{data?.description}</p>
              </div>

              <label>
                <b>Status </b>
              </label>
              <div className="textContainer">
                <p>{data?.status}</p>
              </div>

              <label>
                <b>Problem Code</b>
              </label>
              <div className="textContainer">
                <p>{data?.problem}</p>
              </div>
              <label>
                <b>Created Date</b>
              </label>
              <div className="textContainer">
                <p>{data?.createdDate}</p>
              </div>
              <label>
                <b>Priority</b>
              </label>
              <div className="textContainer">
                <p>{data?.priority}</p>
              </div>
              <label>
                <b>Created By</b>
              </label>
              <div className="textContainer">
                <p>{data?.createdBy}</p>
              </div>
              <label>
                <b>Caller Email</b>
              </label>
              <div className="textContainer">
                <p>{data?.callerEmail}</p>
              </div>
              <label>
                <b>Phone Number</b>
              </label>
              <div className="textContainer">
                <p>{data?.phoneNumber}</p>
              </div>
            </div>
          </div>

          <Button
            className="buttonPrimary mt-2 ml-2"
            onClick={() => {
              dispatch(profileIcon('Ticket'));
              navigate('/mobticket');
            }}
          >
            Back
          </Button>
        </>
      ) : null}
    </>
  );
}
