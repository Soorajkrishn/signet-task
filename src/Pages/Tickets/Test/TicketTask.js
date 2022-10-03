import React, { useEffect, useState } from 'react';
import { Button, Alert,Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import APIUrlConstants from '../../../Config/APIUrlConstants';
import { fetchCall,makeRequest } from '../../../Services/APIService';
import { apiMethods,gaEvents, httpStatusCode } from '../../../Constants/TextConstants';
import Loading from '../../Widgets/Loading';
import './TicketTask.css';
import { userRoleId } from '../../../Utilities/AppUtilities';
import useAnalyticsEventTracker from '../../../Hooks/useAnalyticsEventTracker';
import { Markup } from 'interweave';
import Modal from 'react-bootstrap/Modal';
import Select from 'react-select';
import moment from 'moment';


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
  const [validated, setValidated] = useState(false);
  const [noApiError, setNoApiError] = useState(true);
  const [apiErrorMsg, setApiErrorMsg] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [modelLoading, setLoading] = useState(false);
  const [Priority, setPriority] = useState([]);
  const [problemCode, setProblemCode] = useState([]);
  const [id,setId]=useState(null)
  const [additiondes, setAdditionaldes] = useState('');
  const [date, setDate] = useState('');

  const format = 'yyyy-MM-DD HH:mm';
  const dateandtime = moment.utc(new Date()).subtract(4, 'hours').format(format);

  const [show, setShow] = useState(false);

  const customStyles = {
    control: (base) => ({
      ...base,
      height: 50,
      minHeight: 35,
    }),
  };

  const [postObject, setPostObject] = useState({
    assignedTo: '',
    customerId: '',
    site: '',
    createdBy: '',
    createdDate: '',
    phoneNumber: '',
    status: 'ACTIVE',
    requestType: 'NOC',
    problem: 'System Trouble',
    description: '',
    callerEmail: '',
    priority: '3',
    solutionProvided: '',
    ticketNo: '',
  });
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

  const newDescription = (e) => {
    setAdditionaldes(e.target.value);
    setDate(dateandtime);
  };

 

  const tabledata = searchticket !== null ? searchticket : users;
  const dataslice = tabledata.slice(start, end);

  const fetchPromise = async () => {
    setLoading(true)
    const optionArray = [];
    const fetchSitelist = await makeRequest(`${APIUrlConstants.LIST_SITES}?customerNo=${localStorage.getItem('orgNo')}`);
    const fetchPriority = await makeRequest(APIUrlConstants.LIST_PRIORITY);
    const fetchProblemcode = await makeRequest(APIUrlConstants.LIST_PROBLEM_CODE);
    let resolvedArr;
    if (id) {
      const fetchTicketView = await makeRequest(`${APIUrlConstants.VIEW_TICKET}/${id}`);
      resolvedArr = await Promise.all([fetchSitelist, fetchPriority, fetchProblemcode, fetchTicketView]);
    } else {
      resolvedArr = await Promise.all([fetchSitelist, fetchPriority, fetchProblemcode]);
    }
    resolvedArr.forEach((i) => {
      if (i[0] !== httpStatusCode.SUCCESS) {
        setNoApiError(false);
        setLoading(true);
        setApiErrorMsg(i[1].message ?? 'There was a problem with our ticketing service. Please try again later');
        setShowAlert(true);
        setAlertMessage(i[1].message ?? 'There was a problem with our ticketing service. Please try again later');
        setTimeout(() => {
          setShowAlert(false);
        }, 5000);
      }
    });
    if (resolvedArr && resolvedArr.every((i) => i[0] === httpStatusCode.SUCCESS)) {
      setLoading(true);
      const { 0: Sitelist, 1: PriorityList, 2: ProblemCodeList, 3: fetchTicket } = resolvedArr;
      Sitelist[1]?.data.length > 0 &&
        Sitelist[1]?.data.forEach((i) => {
          optionArray.push({ value: i.siteNo, label: i.siteName });
        });
      setOptions(optionArray);
      setPostObject((prev) => {
        const Current = { ...prev };
        Current.site = Sitelist[1]?.data[0].siteNo;
        return Current;
      });
      setPriority(PriorityList[1]?.data);
      setProblemCode(ProblemCodeList[1]?.data);
      if (id) {
        setLoading(true);
        setPostObject((prev) => {
          const Current = { ...prev };
          Current.requestType = fetchTicket[1]?.data[0].requestType;
          Current.description = fetchTicket[1]?.data[0].description;
          Current.phoneNumber = fetchTicket[1]?.data[0].phoneNumber;
          Current.priority = fetchTicket[1]?.data[0].priority;
          Current.status = fetchTicket[1]?.data[0].status;
          Current.callerEmail = fetchTicket[1]?.data[0].callerEmail;
          Current.solutionProvided = fetchTicket[1]?.data[0].solutionProvided;
          Current.problem = fetchTicket[1]?.data[0].problem;
          Current.ticketNo = fetchTicket[1]?.data[0].ticketNo;
          Current.createdBy = fetchTicket[1]?.data[0].createdBy;
          Current.createdDate = fetchTicket[1]?.data[0].createdDate;
          Current.assignedTo = fetchTicket[1]?.data[0].assignedTo;
          Current.site = Sitelist[1]?.data.filter((i) => i.siteName === fetchTicket[1]?.data[0].site)[0].siteNo;
          return Current;
        });
        setSelectedValue({
          label: fetchTicket[1]?.data[0].site,
          value: Sitelist[1]?.data.filter((i) => i.siteName === fetchTicket[1]?.data[0].site)[0].siteNo,
        });
      }
    }
    setLoading(false);
  };
  const handleClick = (ticketId) => {
    setId(ticketId)
    setShow(true)
  };
  useEffect(() => {
    setPostObject((prev) => {
      const Current = { ...prev };
      Current.customerId = localStorage.getItem('orgNo');
      Current.createdBy = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      Current.callerEmail = localStorage.getItem('email');
      Current.phoneNumber = localStorage.getItem('mobile');
      return Current;
    });
    fetchPromise()
  }, [id]);

  const handleChange = (value) => {
    setSelectedValue(value);
    setPostObject((prev) => {
      const Current = { ...prev };
      Current.site = value.value;
      return Current;
    });
  };
  const saveTicket = async () => {
    setLoading(true);
    let ticketObject = { ...postObject };
    if (id) {
      const updatedDescription = postObject.description + '\n\n' + date + '\n\n' + additiondes;
      ticketObject = { ...postObject, ticketNo: id, description: updatedDescription };
      delete ticketObject.assignedTo;
      delete ticketObject.solutionProvided;
      delete ticketObject.createdDate;
      buttonTracker(gaEvents.UPDATE_TICKET_DETAILS);
    } else {
      buttonTracker(gaEvents.CREATE_NEW_TICKET);
    }
    if (postObject.description && postObject.callerEmail === localStorage.getItem('email') && noApiError) {
      const { 0: status, 1: data } = await fetchCall(APIUrlConstants.CREATE_TICKET, apiMethods.POST, ticketObject);
      const statusCode = status;
      const responseData = data;

      if (statusCode === httpStatusCode.SUCCESS) {
        setLoading(false);
        navigate('/testtickets');
      } else {
        setShowAlert(true);
        setAlertMessage(responseData.message ?? 'something went wrong ');
        setLoading(false);
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      }
    } else if (postObject.callerEmail !== localStorage.getItem('email')) {
      setShowAlert(true);
      setAlertMessage('You are not Authorized');
      setLoading(false);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } else if (noApiError !== true) {
      setShowAlert(true);
      setAlertMessage(apiErrorMsg);
      setLoading(false);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } else {
      setValidated(true);
      setLoading(false);
    }
  };

  const createEditTicket = () => {
    if (postObject.description.trim().length > 0) {
      saveTicket();
    } else {
      setPostObject((prev) => {
        const Current = { ...prev };
        Current.description = '';
        return Current;
      });
      setValidated(true);
    }
  };

  const handleShow = () =>{
    setId(null)
    setShow(true)
    fetchPromise()
    };
    
    const handleClose = () => {
      setShow(false);
      setId(null)
      setPostObject({
        assignedTo: '',
        customerId: '',
        site: '',
        createdBy: '',
        createdDate: '',
        phoneNumber: '',
        status: 'ACTIVE',
        requestType: 'NOC',
        problem: 'System Trouble',
        description: '',
        callerEmail: '',
        priority: '3',
        solutionProvided: '',
        ticketNo: '',
      });
    }
  
  return (
    <div className="wrapperBase">
      {isLoading && <Loading />}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
         {modelLoading && <Loading/>}
        <Modal show={show} onHide={handleClose} dialogClassName="modal-90w modelWrapper" size='xl'  fullscreen='xl-down'>
          <Modal.Header>
              {id?'Edit Ticket':'Create Ticket'}
          </Modal.Header>
          <Modal.Body>
          <Form noValidate validated={validated}>
              

              <Form.Group className="mb-3 input-group">
                <div className="input-container col-6">
                  <Form.Label>
                    Site Name {!id && <span className="requiredTxt">*</span>}
                  </Form.Label>
                  <div>
                    <Select
                      options={options}
                      onChange={handleChange}
                      placeholder="Search for Site Name"
                      value={selectedValue}
                      styles={{ customStyles }}
                      data-testid="siteName"
                    />
                  </div>
                </div>
                <div className="input-container col-6">
                  <Form.Label>Priority {!id && <span className="requiredTxt">*</span>}</Form.Label>
                  <Form.Select
                    className="width-90"
                    data-testid="priority"
                    onChange={(e) => {
                      setPostObject((prev) => {
                        const Current = { ...prev };
                        Current.priority = e.target.value;
                        return Current;
                      });
                    }}
                    value={postObject.priority}
                    disabled={id}
                  >
                    {Priority.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Form.Group>
              <Form.Group className="mb-3 input-group">
                <div className="input-container col-6">
                  <Form.Label>Problem Code  {!id && <span className="requiredTxt">*</span>}</Form.Label>
                  <Form.Select
                    data-testid="priority"
                    onChange={(e) => {
                      setPostObject((prev) => {
                        const Current = { ...prev };
                        Current.problem = e.target.value;
                        return Current;
                      });
                    }}
                    value={postObject.priority}
                    disabled={id}
                  >
                    {problemCode.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                {id && (
                  <div className="input-container col-6">
                    <Form.Label>Created Date</Form.Label>
                    <Form.Control
                      placeholder="Created Date"
                      type="text"
                      value={postObject.createdDate}
                      disabled
                    />
                  </div>
                )}
              </Form.Group>
              {id && (
                <Form.Group className="mb-3 input-group">
                  <div className="input-container col-6">
                    <Form.Label>Created By</Form.Label>
                    <Form.Control
                      placeholder="Created By"
                      type="text"
                      className="width-90"
                      value={postObject.createdBy}
                      disabled
                    />
                  </div>
                  <div className="input-container col-6">
                    <Form.Label>Client Email</Form.Label>
                    <Form.Control
                      placeholder="Client Email"
                      type="text"
                      className="width-90"
                      value={postObject.callerEmail}
                      disabled
                    />
                  </div>
                </Form.Group>
              )}
              
              <Form.Group className="mb-3 input-group">
                <div className="input-container col">
                  <Form.Label>Description {!id && <span className="requiredTxt">*</span>}</Form.Label>
                  <Form.Control
                    as="textarea"
                    className={id?'':"description"}
                    placeholder="Enter description"
                    required
                    name="description"
                    onChange={(e) => {
                      setPostObject((prev) => {
                        const Current = { ...prev };
                        Current.description = e.target.value;
                        return Current;
                      });
                    }}
                 
                    value={postObject.description}
                    disabled={id}
                  />
                  <Form.Control.Feedback type="invalid">Description is required</Form.Control.Feedback>
                </div>
              </Form.Group>
              {id && (
                <div className="input-container col">
                  <Form.Label>Additional Details</Form.Label>
                  <Form.Control
                    placeholder="Additional Details"
                    as="textarea"
                    onChange={(e) => newDescription(e)}
                  />
                </div>
              )}
            </Form>
          </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className='buttonDefault text-center minHeight45' onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" className="buttonPrimary text-center" onClick={createEditTicket}>
            {id?'Update':'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
        <div className="titleHeader d-flex align-items-center justify-content-between">
          <div className="info">
            <h6>Tickets</h6>
          </div>
          <div className="headerAction d-flex align-items-center">
            <Button
              className="buttonPrimary"
              onClick={handleShow}
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
                    {pageNo === lastpageNO ? '' : <Button onClick={lastPage}>{lastpageNO}</Button>}
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
                <p>
                  <Markup
                    content={
                      ticketdetails !== null ? ticketdetails[0].description : firstTicket !== null && firstTicket.description
                    }
                  />
                </p>
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
                      onClick={() =>
                        handleClick(
                          ticketdetails !== null ? ticketdetails[0].ticketNo : firstTicket !== null && firstTicket.ticketNo,
                        )
                      }
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
        </>
        
      )}
    </div>
  );
}

export default Tickettask;
