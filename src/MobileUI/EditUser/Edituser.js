import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { apiMethods, gaEvents, httpStatusCode } from '../../Constants/TextConstants';
import { fetchCall, makeRequest } from '../../Services/APIService';
import Alerts from '../../Pages/Widgets/Alerts';
import Loading from '../../Pages/Widgets/Loading';
import AsyncSelect from 'react-select/async';
import useAnalyticsEventTracker from '../../Hooks/useAnalyticsEventTracker';
import Navigation from '../NavBar/Navbar';
import Select from 'react-select';
import { setDefaultEventParameters } from 'firebase/analytics';

export default function EditUserDetails() {
  const { id } = useParams();
  const [roles, setRoles] = useState();
  const [alertVarient, setAlertVarient] = useState('');
  const [rName, setRname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedValue, setSelectedValue] = useState(null);
  const [updateRole, setUpdateRole] = useState('');
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    orgEmail: '',
    orgName: '',
    roleId: '',
    status: '',
    userId: '',
    orgNo: '',
  });
  const [showAlert, setShowAlert] = useState(false);
  const { buttonTracker } = useAnalyticsEventTracker();
  const closeAlert = () => setShowAlert(false);
  const [roleValidated, setRoleValidated] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, touchedFields },
  } = useForm({
    mode: 'all',
  });
  const timer = useRef(null);
  const { roleId } = user;

  console.log(user.roleId);

  const fetchRoles = async () => {
    const { 0: status, 1: result } = await makeRequest(APIUrlConstants.GET_USER_ROLES);

    if (status === httpStatusCode.SUCCESS) {
      setRoles(result.data);
    }
  };

  const roleName = roles?.map((i) => Object.create({ value: i.roleId, label: i.name }));

  const roleChange = (item) => {
    setUpdateRole(item.label);
    setUser((prevState) => ({ ...prevState, roleId: item?.value }));
  };

  const Option = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  const handleChange = (value) => {
    setSelectedValue(value);
    setUser((prevState) => ({ ...prevState, orgName: value.companyName, orgNo: value.customerNo }));
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      height: 50,
      minHeight: 35,
    }),
  };

  const statusChange = (value) => {
    setUser((prevState) => ({ ...prevState, status: value?.value }));
  };

  // console.log(updateRole)

  const loadOptions = async (searchtext) => {
    if (searchtext.length >= 3) {
      const response = await makeRequest(`${APIUrlConstants.SEARCH_ORG}?company=${searchtext}`);
      const statusCode = response[0];
      const responseData = response[1];
      if (httpStatusCode.SUCCESS === statusCode) {
        return responseData.data;
      }
      return responseData.data;
    }
    return null;
  };

  useEffect(() => {
    if (roles && roleId) {
      const filterRole = roles?.filter((each) => each.roleId === roleId);
      console.log(filterRole);
      setRname(filterRole[0].name);
    }
  }, [roles, roleId]);

  const fetchUserDetails = useCallback(async () => {
    setIsLoading(true);
    const {
      0: statusCode,
      1: { data },
    } = await makeRequest(`${APIUrlConstants.GET_USER_DETAILS}/${id}`);
    if (statusCode === httpStatusCode.SUCCESS) {
      const res = data;
      const userValues = {
        firstName: res?.firstName ?? '',
        lastName: res?.lastName ?? '',
        orgEmail: res?.orgEmail ?? '',
        orgName: res?.organization ?? '',
        roleId: res?.roleId ?? '',
        status: res?.status ?? '',
        userId: id,
      };
      if (userValues.roleId === '') {
        setRoleValidated(true);
      }
      reset(userValues);
      setUser(userValues);
      setSelectedValue({ companyName: res?.organization ?? '' });
    }
    setIsLoading(false);
  }, [id, reset]);

  useEffect(() => {
    fetchUserDetails();
    fetchRoles();
  }, [fetchUserDetails]);

  const updateUser = async () => {
    buttonTracker(gaEvents.UPDATE_USER_DETAILS);
    setIsLoading(true);
    const { 0: status, 1: data } = await fetchCall(APIUrlConstants.UPDATE_USER_DETAILS, apiMethods.PUT, user);
    const statusCode = status;
    const responseData = data;

    if (statusCode === httpStatusCode.SUCCESS) {
      setAlertMessage('User updated successfully');
      setShowAlert(true);
      setAlertVarient('success');
      setIsLoading(false);
      timer.current = setTimeout(() => {
        closeAlert();
        navigate('/users');
      }, 5000);
    } else {
      setShowAlert(true);
      setAlertVarient('danger');
      setAlertMessage(responseData.message ?? 'something went wrong ');
      setIsLoading(false);
      setTimeout(() => {
        closeAlert();
      }, 5000);
    }
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <>
      <Navigation />
      <div className="wrapperBase">
        {showAlert && (
          <Alerts
            variant={alertVarient}
            onClose={() => {
              setShowAlert(true);
            }}
            alertshow={alertMessage}
          />
        )}

        <div className="container">
          {isLoading && <Loading />}
          <div>
            <div className="editWrap">
              <Form onSubmit={handleSubmit(updateUser)} id="editUserForm">
                <div className="mb-3">
                  <Form.Label>
                    First Name <span className="requiredTxt">*</span>
                  </Form.Label>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      id="fullname"
                      data-testid="FName"
                      name="fullname"
                      value={user.firstName ?? ''}
                      isValid={touchedFields.firstName && !errors.firstName}
                      isInvalid={errors.firstName}
                      {...register('firstName', {
                        required: 'First Name is Required',
                        minLength: {
                          value: 3,
                          message: 'Minimum 3 Characters Required for  first name',
                        },
                        maxLength: {
                          value: 30,
                          message: 'Name was Too High',
                        },
                        pattern: {
                          message: 'Enter a valid First Name',
                        },
                      })}
                      onChange={(e) => {
                        setUser((prevState) => ({ ...prevState, firstName: e.target.value }));
                      }}
                    />
                    {errors.firstName && <p className="text-danger">{errors.firstName.message}</p>}
                  </Form.Group>
                </div>
                <div className="mb-3">
                  <Form.Label>
                    Last Name <span className="requiredTxt">*</span>
                  </Form.Label>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      id="lastName"
                      name="lastName"
                      data-testid="LName"
                      value={user.lastName}
                      isValid={touchedFields.lastName && !errors.lastName}
                      isInvalid={errors.lastName}
                      {...register('lastName', {
                        required: 'Last Name is Required',
                        maxLength: {
                          value: 30,
                          message: 'Last name was Too High',
                        },
                        pattern: {
                          message: 'Enter a valid last Name',
                        },
                      })}
                      onChange={(e) => {
                        setUser((prevState) => ({ ...prevState, lastName: e.target.value }));
                      }}
                    />
                    {errors.lastName && <p className="text-danger">{errors.lastName.message}</p>}
                  </Form.Group>
                </div>
                <div className="mb-3">
                  <Form.Label>
                    Organization <span className="requiredTxt">*</span>
                  </Form.Label>
                  <Form.Group>
                    <AsyncSelect
                      value={selectedValue}
                      getOptionLabel={(e) => e.companyName}
                      getOptionValue={(e) => e.companyName}
                      loadOptions={loadOptions}
                      onChange={handleChange}
                      placeholder="Search for Organization Name"
                      styles={customStyles}
                      components={{
                        IndicatorSeparator: () => null,
                      }}
                    />
                    {errors.Organization && <p className="text-danger">{errors.Organization.message}</p>}
                  </Form.Group>
                </div>
                <div className="mb-3">
                  <Form.Label>
                    Organization Email <span className="requiredTxt">*</span>
                  </Form.Label>
                  <Form.Group>
                    <Form.Control
                      type="email"
                      name="orgEmail"
                      data-testid="orgEmail"
                      id="orgEmail"
                      required
                      disabled
                      value={user?.orgEmail}
                      {...register('orgEmail', {
                        pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$',
                      })}
                    />
                    {errors.orgEmail && <p className="text-danger">{errors.orgEmail.message}</p>}
                  </Form.Group>
                </div>

                <div className="mb-3">
                  <Form.Label>
                    Role <span className="requiredTxt">*</span>
                  </Form.Label>
                  <Form.Group className="mb-3 userSelect">
                    <Select options={roleName} onChange={roleChange} placeholder={rName} styles={{ customStyles }} />
                    {roleValidated ? <Form.Control.Feedback type="invalid">Role is required </Form.Control.Feedback> : null}
                  </Form.Group>
                </div>
                <div className="mb-3">
                  <Form.Label>
                    Status <span className="requiredTxt">*</span>
                  </Form.Label>
                  <Form.Group className="userSelect mb-2">
                    <Select
                      options={Option}
                      onChange={statusChange}
                      placeholder={user.status}
                      styles={{ customStyles }}
                      data-testid="siteName"
                    />
                  </Form.Group>
                </div>
                <div className="d-flex justify-content-md-start justify-content-sm-center justify-content-center editAction">
                  <input
                    className="buttonDefault text-center"
                    type="submit"
                    onClick={() => {
                      navigate('/mobusers');
                    }}
                    value="Cancel"
                  />
                  <input
                    className="buttonPrimary text-center"
                    type="submit"
                    value="Update"
                    disabled={roleValidated ? 'disabled' : ''}
                  />
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
