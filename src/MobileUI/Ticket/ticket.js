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
import moment from 'moment';
import Select from 'react-select';

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
  const [id, setId] = useState(null);
  const [ticketNo, setTicketNo] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [additiondes, setAdditionaldes] = useState('');
  const [date, setDate] = useState('');
  const [noApiError, setNoApiError] = useState(true);
  const [apiErrorMsg, setApiErrorMsg] = useState('');
  const [Priority, setPriority] = useState([]);
  const [problemCode, setProblemCode] = useState([]);
  const [options, setOptions] = useState([]);
  const [validated, setValidated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState(false);
  const closeAlert = () => setShowAlert(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);
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

  const format = 'yyyy-MM-DD HH:mm';
  const dateandtime = moment.utc(new Date()).subtract(4, 'hours').format(format);

  const customStyles = {
    control: (base) => ({
      ...base,
      height: 50,
      minHeight: 35,
    }),
  };

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

  const filteredTicket = ticket.filter((each) => each.ticketNo === ticketNo);

  const fetchPromise = async () => {
    setLoading(true);
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

  useEffect(() => {
    setPostObject((prev) => {
      const Current = { ...prev };
      Current.customerId = localStorage.getItem('orgNo');
      Current.createdBy = localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName');
      Current.callerEmail = localStorage.getItem('email');
      Current.phoneNumber = localStorage.getItem('mobile');
      return Current;
    });
    fetchPromise();
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

  console.log(page);

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

  const handleShow = (ticketId) => {
    setId(ticketId);
    setShow(true);
  };
  const modalClose = () => {
    setShow(false);
  };

  const handleClose = () => {
    setModalShow(false);
    setId(null);
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
  };

  const newDescription = (e) => {
    setAdditionaldes(e.target.value);
    setDate(dateandtime);
  };

  const editTicket = (number) => {
    setId(number);
    setModalShow(true);
    setShow(false);
  };

  return (
    <>
      <Modal show={show} onHide={modalClose}>
        <Modal.Header>
          <p>
            <b>Ticket No : </b>
            {filteredTicket[0]?.ticketNo}
          </p>
          <div onClick={modalClose} className="close">
            <img src="/images/tasks/close.svg" alt="" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div>
            <h5>
              <b>Description</b>
            </h5>
            <p>{filteredTicket[0]?.description}</p>
            <h5>
              <b>Status</b>
            </h5>
            <p>{filteredTicket[0]?.status}</p>
            <h5>
              <b>Problem</b>
            </h5>
            <p>{filteredTicket[0]?.problem}</p>
            <h5>
              <b>Created Date</b>
            </h5>
            <p>{filteredTicket[0]?.createdDate}</p>
            <h5>
              <b>Priority</b>
            </h5>
            <p>{filteredTicket[0]?.priority}</p>
            <h5>
              <b>Created By</b>
            </h5>
            <p>{filteredTicket[0]?.createdBy}</p>
            {filteredTicket[0]?.callerEmail === localStorage.getItem('email') && (
              <>
                <h5>
                  <b>Edit</b>
                </h5>
                <Button variant="link" id={filteredTicket[0]?.ticketNo} onClick={() => editTicket(filteredTicket[0]?.ticketNo)}>
                  <img src="/images/users/edit.svg" id={filteredTicket[0]?.ticketNo} alt="Edit" />
                </Button>
              </>
            )}
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={modalShow} onHide={handleClose} fullscreen="xl-down">
        <Modal.Header>{id ? 'Edit Ticket' : 'Create Ticket'}</Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated}>
            <Form.Group className="mb-3 input-group">
              <div className="input-container col-6">
                <Form.Label>Site Name {!id && <span className="requiredTxt">*</span>}</Form.Label>
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
                <Form.Label>Problem Code {!id && <span className="requiredTxt">*</span>}</Form.Label>
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
                  <Form.Control placeholder="Created Date" type="text" value={postObject.createdDate} disabled />
                </div>
              )}
            </Form.Group>
            {id && (
              <Form.Group className="mb-3 input-group">
                <div className="input-container col-6">
                  <Form.Label>Created By</Form.Label>
                  <Form.Control placeholder="Created By" type="text" className="width-90" value={postObject.createdBy} disabled />
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
                  className={id ? '' : 'description'}
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
                <Form.Control placeholder="Additional Details" as="textarea" onChange={(e) => newDescription(e)} />
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="buttonDefault text-center minHeight45" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" className="buttonPrimary text-center" onClick={createEditTicket}>
            {id ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="container">
        {isLoading && <Loading />}
        <Navbar />
        <ul>
          {sliceTicket.map((v) => (
            <li className="ticketData" onClick={() => handleShow(v.ticketNo)}>
              <p className="truncate">{v.description}</p>
              <p>{v.ticketNo}</p>
            </li>
          ))}
        </ul>
        {loader && <Loading />}
        <div
          className="addTicket"
          onClick={() => {
            setModalShow(true);
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
