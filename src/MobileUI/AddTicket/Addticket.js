import React, { useState,useEffect} from "react";
import { Button, Form } from "react-bootstrap";
import Navigation from '../NavBar/Navbar'
import { useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select';
import useAnalyticsEventTracker from '../../Hooks/useAnalyticsEventTracker';
import moment from 'moment';
import './Addticket.css'
import { fetchCall, makeRequest } from '../../Services/APIService';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { apiMethods, gaEvents, httpStatusCode } from '../../Constants/TextConstants';

export default function AddTicket() {
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
    const { buttonTracker } = useAnalyticsEventTracker();
    const [noApiError, setNoApiError] = useState(true);
    const [apiErrorMsg, setApiErrorMsg] = useState('');
    const [additiondes, setAdditionaldes] = useState('');
    const [date, setDate] = useState('');

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

    const temp=Priority.map((i)=> Object.create({value:i,label:i}))

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
            Current.site = Sitelist[1]?.data[0].siteNo;
            return Current;
          });
          setPriority(PriorityList[1]?.data);
          setProblemCode(ProblemCodeList[1]?.data);
          setLoading(false);
          if (id) {
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
      useEffect(()=>{
        fetchPromise()
      },[])
    return (
        <>
            <Navigation />
            <div className="container">
                <Form noValidate validated={validated} className="fromWrap">
                    <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea"
                            placeholder="Enter description"
                            required
                            name="description" />
                    </Form.Group>
                    {id && <Form.Group>
                        <Form.Label>Additional Description</Form.Label>
                        <Form.Control as="textarea"
                            placeholder="Enter description"
                            required
                            name="description" 
                            onChange={(e)=>newDescription(e)}/>
                    </Form.Group>}
                    <Form.Group>
                        <Form.Label>Site Name</Form.Label>
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
                        <Form.Label>Priority</Form.Label>                       
                        <Select
                            options={temp}
                            onChange={handleChange}
                            placeholder="Search for Site Name"
                            value={selectedValue}
                            styles={{ customStyles }}
                            data-testid="siteName"
                        /> 
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Problem Code</Form.Label>
                        <Form.Select >
                            {ProblemCode.map((i)=><option id="op">{i}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Form>
                <div>
                    <Button className="buttonPrimary mb-5 mt-4 mr-1">cancel</Button>
                    <Button className="buttonPrimary mb-5 mt-4 mr-1">create</Button>
                </div>
            </div>
        </>

    )
}