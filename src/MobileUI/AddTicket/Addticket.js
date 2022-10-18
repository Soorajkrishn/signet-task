import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import useAnalyticsEventTracker from '../../Hooks/useAnalyticsEventTracker';
import moment from 'moment';
import './Addticket.css';
import { fetchCall, makeRequest } from '../../Services/APIService';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { apiMethods, gaEvents, httpStatusCode } from '../../Constants/TextConstants';
import Loading from '../../Pages/Widgets/Loading';
import { profileIcon } from '../../Redux/Actions/Actions';
import { useDispatch } from 'react-redux';

export default function MobileAddTicket() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [Priority, setPriority] = useState([]);
  const [ProblemCode, setProblemCode] = useState([]);
  const [PostObject, setPostObject] = useState({
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
  const [options, setOptions] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVarient, setAlertVarient] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const { id } = useParams();
  const [validated, setValidated] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [priorityValue, setPriorityValue] = useState(null);
  const [problemCodeValue, setProblemCodeValue] = useState(null);
  const { buttonTracker } = useAnalyticsEventTracker();
  const [noApiError, setNoApiError] = useState(true);
  const [apiErrorMsg, setApiErrorMsg] = useState('');
  const [additiondes, setAdditionaldes] = useState('');
  const [date, setDate] = useState('');
  const dispatch = useDispatch()
  const format = 'yyyy-MM-DD HH:mm';
  const dateandtime = moment.utc(new Date()).subtract(4, 'hours').format(format);

  const customStyles = {
    control: (base) => ({
      ...base,
      height: 50,
      minHeight: 35,
    }),
  };

  const handleChange = (value) => {
    setSelectedValue(value);
    setPostObject((prev) => {
      const Current = { ...prev };
      Current.site = value.value;
      return Current;
    });
  };

  const priorityChange = (value) => {
    setPriorityValue(value);
    setPostObject((prev) => {
      const Current = { ...prev };
      Current.priority = value.value;
      return Current;
    });
  };
  const ProblemCodeChange = (value) => {
    setProblemCodeValue(value);
    setPostObject((prev) => {
      const Current = { ...prev };
      Current.problem = value.value;
      return Current;
    });
  };

  const priorityOptions = Priority.map((i) => Object.create({ value: i, label: i }));

  const ProblemCodeOption = ProblemCode.map((item) => Object.create({ value: item, label: item }));

  const newDescription = (e) => {
    setAdditionaldes(e.target.value);
    setDate(dateandtime);
  };

  const fetchPromise = async () => {
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
        setApiErrorMsg(i[1].message ?? 'There was a problem with our ticketing service. Please try again later');
        setShowAlert(true);
        setAlertVarient('danger');
        setAlertMessage(i[1].message ?? 'There was a problem with our ticketing service. Please try again later');
        setTimeout(() => {
          setShowAlert(false);
        }, 5000);
      }
    });
    if (resolvedArr && resolvedArr.every((i) => i[0] === httpStatusCode.SUCCESS)) {
      const { 0: Sitelist, 1: PriorityList, 2: ProblemCodeList, 3: fetchTicket } = resolvedArr;
      Sitelist[1]?.data.length > 0 &&
        Sitelist[1]?.data.forEach((i) => {
          optionArray.push({ value: i.siteNo, label: i.siteName });
        });
      setOptions(optionArray);
      setPostObject((prev) => {
        const Current = { ...prev };
        Current.site = Sitelist[1]?.data[0]?.siteNo;
        return Current;
      });
      setPriority(PriorityList[1]?.data);
      setProblemCode(ProblemCodeList[1]?.data);
      setLoading(false);
      if (id) {
        setPostObject((prev) => {
          const Current = { ...prev };
          Current.requestType = fetchTicket[1]?.data[0]?.requestType;
          Current.description = fetchTicket[1]?.data[0]?.description;
          Current.phoneNumber = fetchTicket[1]?.data[0]?.phoneNumber;
          Current.priority = fetchTicket[1]?.data[0]?.priority;
          Current.status = fetchTicket[1]?.data[0]?.status;
          Current.callerEmail = fetchTicket[1]?.data[0]?.callerEmail;
          Current.solutionProvided = fetchTicket[1]?.data[0]?.solutionProvided;
          Current.problem = fetchTicket[1]?.data[0]?.problem;
          Current.ticketNo = fetchTicket[1]?.data[0]?.ticketNo;
          Current.createdBy = fetchTicket[1]?.data[0]?.createdBy;
          Current.createdDate = fetchTicket[1]?.data[0]?.createdDate;
          Current.assignedTo = fetchTicket[1]?.data[0]?.assignedTo;
          Current.site = Sitelist[1]?.data.filter((i) => i.siteName === fetchTicket[1]?.data[0]?.site)[0]?.siteNo;
          return Current;
        });
        setSelectedValue({
          label: fetchTicket[1]?.data[0]?.site,
          value: Sitelist[1]?.data.filter((i) => i.siteName === fetchTicket[1]?.data[0]?.site)[0]?.siteNo,
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
  }, []);

  const saveTicket = async () => {
    setSaveLoading(true);
    let ticketObject = { ...PostObject };
    if (id) {
      const updatedDescription = PostObject.description + '\n\n' + date + '\n\n' + additiondes;
      ticketObject = { ...PostObject, ticketNo: id, description: updatedDescription };
      delete ticketObject.assignedTo;
      delete ticketObject.solutionProvided;
      delete ticketObject.createdDate;
      buttonTracker(gaEvents.UPDATE_TICKET_DETAILS);
    } else {
      buttonTracker(gaEvents.CREATE_NEW_TICKET);
    }
    if (PostObject.description && PostObject.callerEmail === localStorage.getItem('email') && noApiError) {
      const { 0: status, 1: data } = await fetchCall(APIUrlConstants.CREATE_TICKET, apiMethods.POST, ticketObject);
      const statusCode = status;
      const responseData = data;

      if (statusCode === httpStatusCode.SUCCESS) {
        setSaveLoading(false);
        dispatch(profileIcon('Ticket'))
        navigate('/mobticket');
      } else {
        setShowAlert(true);
        setAlertVarient('danger');
        setAlertMessage(responseData.message ?? 'something went wrong ');
        setSaveLoading(false);
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      }
    } else if (PostObject.callerEmail !== localStorage.getItem('email')) {
      setShowAlert(true);
      setAlertVarient('danger');
      setAlertMessage('You are not Authorized');
      setSaveLoading(false);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } else if (noApiError !== true) {
      setShowAlert(true);
      setAlertVarient('danger');
      setAlertMessage(apiErrorMsg);
      setSaveLoading(false);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } else {
      setValidated(true);
      setSaveLoading(false);
    }
  };

  const createEditTicket = () => {
    if (PostObject.description.trim().length > 0) {
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
  return (
    <>
      {isLoading && <Loading />}
      <div className="container">
        <Form noValidate validated={validated} className="fromWrap">
          <Form.Group>
            <Form.Label>Description {!id && <span className="requiredTxt">*</span>}</Form.Label>
            <Form.Control as="textarea" 
            required 
            onChange={(e) => {
              setPostObject((prev) => {
                const Current = { ...prev };
                Current.description = e.target.value;
                return Current;
              });
            }} 
            placeholder="Enter description" 
            name="description" 
            disabled={id}
            value={PostObject.description} />
          </Form.Group>
          {id && (
            <Form.Group>
              <Form.Label>Additional Description {id && <span className="requiredTxt">*</span>}</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter description"
                required
                name="description"
                onChange={(e) => newDescription(e)}
              />
            </Form.Group>
          )}
          <Form.Group>
            <Form.Label>Site Name {!id && <span className="requiredTxt">*</span>}</Form.Label>
            <Select
              options={options}
              onChange={handleChange}
              placeholder="Search for Site Name"
              value={selectedValue}
              styles={{ customStyles }}
              data-testid="siteName"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Priority {!id && <span className="requiredTxt">*</span>}</Form.Label>
            <Select
              options={priorityOptions}
              onChange={priorityChange}
              placeholder="Priority"
              value={priorityValue}
              styles={{ customStyles }}
              data-testid="siteName"
              isDisabled={id}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Problem Code {!id && <span className="requiredTxt">*</span>}</Form.Label>
            <Select
              options={ProblemCodeOption}
              onChange={ProblemCodeChange}
              placeholder="Problem Code"
              value={problemCodeValue}
              styles={{ customStyles }}
              data-testid="siteName"
              isDisabled={id}
            />
          </Form.Group>
          {id && (
            <div className="input-container">
              <Form.Label>Created Date</Form.Label>
              <Form.Control placeholder="Created Date" type="text" value={PostObject.createdDate} disabled />
            </div>
          )}
          {id && (
            <div className="input-container">
              <Form.Label>Created By</Form.Label>
              <Form.Control placeholder="Created By" type="text" value={PostObject.createdBy} disabled />
            </div>
          )}
          {id && (
            <div className="input-container">
              <Form.Label>Assigned To</Form.Label>
              <Form.Control placeholder="Assigned To" type="text" value={PostObject.assignedTo} disabled />
            </div>
          )}
          {id && (
            <div className="input-container">
              <Form.Label>Solution Provided</Form.Label>
              <Form.Control placeholder="Solution Provided" type="text" value={PostObject.solutionProvided} disabled />
            </div>
          )}
        </Form>
        <div className=" d-flex align-items-center justify-content-center">
          <Button type="submit" className="buttonPrimary mb-5 mt-4 mr-1" onClick={() => {
            dispatch(profileIcon('Ticket'))
            navigate('/mobticket')
          }}>
            Cancel
          </Button>
          <Button className="buttonPrimary mb-5 mt-4 mr-1" onClick={() => createEditTicket()}>
            {id ? 'Edit' : 'Create'}
          </Button>
        </div>
      </div>
    </>
  );
}
