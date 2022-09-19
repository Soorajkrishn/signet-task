import React, { useEffect, useState } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import APIUrlConstants from '../../../Config/APIUrlConstants';
import { makeRequest } from '../../../Services/APIService';
import { gaEvents, httpStatusCode } from '../../../Constants/TextConstants';
import Loading from '../../Widgets/Loading';
import './TicketTask.css';
import { userRoleId } from '../../../Utilities/AppUtilities';
import useAnalyticsEventTracker from '../../../Hooks/useAnalyticsEventTracker';

function Tickettask() {
  const navigate = useNavigate();
  const [users, setUser] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState(false);
  const closeAlert = () => setShowAlert(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { buttonTracker } = useAnalyticsEventTracker();
  const [ticketdetails, setTicketdetails] = useState(null);
  const [firstTicket, setFirstticket] = useState(null);
  const [searchticket, setSearchticket] = useState(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(7);
  const [pageNo, setPageno] = useState(1);

  const fetchAllUserDetails = async () => {
    setIsLoading(true);
    const { 0: statusCode, 1: data } = await makeRequest(
      APIUrlConstants.TICKETS_LIST + `?customerNo=${localStorage.getItem('orgNo')}`,
    );
    if (statusCode === httpStatusCode.SUCCESS) {
      setIsLoading(false);
      setUser(data.data);
      setFirstticket(data.data[0]);
    } else {
      setShowAlert(true);
      setError(true);
      setAlertMessage(data?.message || 'Failed to fetch tickets');
      setIsLoading(false);
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
    }
  };
  const listSize = searchticket !== null ? searchticket.length : users.length;
  const pages = listSize / 7;
  const lastpageNO = Math.ceil(pages);

  const priority = ticketdetails !== null ? ticketdetails[0].priority : firstTicket !== null && firstTicket.priority;
  const prioritylist = (p) => {
    switch (p) {
      case '1':
        return (
          <>
            <i className="fa-solid fa-arrow-down text-success" />
            <span>Low</span>
          </>
        );
      case '2':
        return (
          <>
            <i className="fa-solid fa-arrow-down text-success" />
            <span>Low</span>
          </>
        );
      case '3':
        return (
          <>
            <i className="fa-solid fa-arrow-down text-success" />
            <span>Low</span>
          </>
        );
      case '4':
        return (
          <>
            <i className="fa-solid fa-arrow-up text-danger" />
            <span>High</span>
          </>
        );
      case '5':
        return (
          <>
            <i className="fa-solid fa-arrow-up text-danger" />
            <span>High</span>
          </>
        );
      default:
        return 'Very low';
    }
  };
  const ticketFilter = (ticketNumber) => {
    const ticketData = users.filter((each) => each.ticketNo === ticketNumber);
    setTicketdetails(ticketData);
  };
  useEffect(() => {
    if (localStorage.getItem('roleId') === userRoleId.signetAdmin) {
      navigate('/');
    } else {
      fetchAllUserDetails();
    }
  }, []);
  const filterData = (data) => {
    const searchData = users.filter((each) => each.description.toUpperCase().includes(data.toUpperCase()));
    setSearchticket(searchData);
  };
  const pageIncrement = () => {
    if (pageNo !== lastpageNO) {
      setStart(start + 7);
      setEnd(end + 7);
      setPageno(pageNo + 1);
    }
  };
  const pageDecrement = () => {
    if (pageNo === lastpageNO) {
      setStart(start - 7);
      setEnd(start);
      setPageno(pageNo - 1);
    } else if (start !== 0) {
      setStart(start - 7);
      setEnd(end - 7);
      setPageno(pageNo - 1);
    }
  };

  const lastPage = () => {
    setStart(7 * (lastpageNO - 1));
    setEnd(listSize);
    setPageno(lastpageNO);
  };

  const tabledata = searchticket !== null ? searchticket : users;
  const dataslice = tabledata.slice(start, end);

  return (
    <div className="wrapperBase">
      {isLoading && <Loading />}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="titleHeader d-flex align-items-center justify-content-between">
          <div className="info">
            <h6>Tickets</h6>
          </div>
          <div className="headerAction d-flex align-items-center">
            <Button
              className="buttonPrimary"
              onClick={() => {
                buttonTracker(gaEvents.NAVIGATE_ADD_TICKET);
                navigate(`/ticket/add`);
              }}
            >
              <img src={process.env.REACT_APP_PUBLIC_URL + 'images/users/plus.svg'} alt="" /> Create Ticket
            </Button>
          </div>
          <div className="row container">
            <div className="col-4 ticket_container ">
              <div className="input-group mb-3 searchbox">
                <input type="search" className="search" placeholder="Search" onChange={(e) => filterData(e.target.value)} />
                <div className="input-group-append">
                  <Button>
                    <i className="fa-sharp fa-solid fa-magnifying-glass" />
                  </Button>
                </div>
              </div>
              <table>
                <tbody>
                  {dataslice.map((val) => (
                    <tr key={val.ticketNo} onClick={() => ticketFilter(val.ticketNo)} className="ticket-list">
                      <td className="ticket">
                        <span className="truncate text">{val.description}</span>
                        <span className="text">
                          <i className="fa-sharp fa-solid fa-bookmark" /> {val.ticketNo}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                {lastpageNO <= 1 ? (
                  <Button>1</Button>
                ) : (
                  <>
                    <Button onClick={pageDecrement}>
                      <i className="fa-solid fa-angle-left" />
                    </Button>
                    <Button>{pageNo}</Button>
                    <Button onClick={lastPage}>{lastpageNO}</Button>
                    <Button onClick={pageIncrement}>
                      <i className="fa-solid fa-angle-right" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="col-5 description">
              <div className="content">
                <p>
                  <i className="fa-sharp fa-solid fa-bookmark" />{' '}
                  {ticketdetails !== null ? ticketdetails[0].ticketNo : firstTicket !== null && firstTicket.ticketNo}
                </p>
                <h4 className="heading">Description</h4>
                <p>{ticketdetails !== null ? ticketdetails[0].description : firstTicket !== null && firstTicket.description}</p>
              </div>
            </div>
            <div className="col-3 ">
              <div className="details">
                <h4 className="heading">Status</h4>
                <div className="values">
                  <p>{ticketdetails !== null ? ticketdetails[0].status : firstTicket !== null && firstTicket.status}</p>
                </div>

                <h4 className="heading">Priority</h4>
                <div className="values">
                  <p>{prioritylist(priority)}</p>
                </div>

                <h4 className="heading">Created Date</h4>
                <div className="values">
                  <p>{ticketdetails !== null ? ticketdetails[0].createdDate : firstTicket !== null && firstTicket.createdDate}</p>
                </div>

                <h4 className="heading">Problem</h4>
                <div className="values">
                  <p>{ticketdetails !== null ? ticketdetails[0].problem : firstTicket !== null && firstTicket.problem}</p>
                </div>

                <h4 className="heading">Phone Number</h4>
                <div>
                  <p>{ticketdetails !== null ? ticketdetails[0].phoneNumber : firstTicket !== null && firstTicket.phoneNumber}</p>
                </div>

                {(ticketdetails !== null ? ticketdetails[0].callerEmail : firstTicket !== null && firstTicket.callerEmail) ===
                  localStorage.getItem('email') && (
                  <>
                    <h4>Edit</h4>
                    <Button
                      variant="link"
                      id={ticketdetails !== null ? ticketdetails[0].ticketNo : firstTicket !== null && firstTicket.ticketNo}
                    >
                      <img
                        src="/images/users/edit.svg"
                        id={ticketdetails !== null ? ticketdetails[0].ticketNo : firstTicket !== null && firstTicket.ticketNo}
                        alt="Edit"
                      />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          {showAlert && (
            <Alert variant={!error ? 'success' : 'danger'} className="alertWrapper" onClose={closeAlert} dismissible>
              <Alert.Heading>{alertMessage}</Alert.Heading>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}

export default Tickettask;
