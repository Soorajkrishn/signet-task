import React, { useState, useEffect } from 'react';
import { Button, Form, Container, Alert } from 'react-bootstrap';
import './Profile.css';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { apiMethods, gaEvents, httpStatusCode } from '../../Constants/TextConstants';
import { fetchCall } from '../../Services/APIService';
import Alerts from '../Widgets/Alerts';
import Loading from '../Widgets/Loading';
import { authentication } from '../../Config/FirebaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { userRoleId, roleId } from '../../Utilities/AppUtilities';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../Redux/Actions/Actions';
import useAnalyticsEventTracker from '../../Hooks/useAnalyticsEventTracker';
import ReactGA from 'react-ga4';

export default function Profile() {
  const [isEditable, setIsEditable] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '[]'));
  const [isLoading, setIsLoading] = useState(false);
  const [alertVarient, setAlertVarient] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const closeAlert = () => setShowAlert(false);
  const [validPhone, setPhoneValid] = useState(false);
  const [phoneVer, setPhonever] = useState(false);
  const [toogle, setToogle] = useState(false);
  const [appVerifier, setAppVerifier] = useState(null);
  const [variant, setVarient] = useState('');
  const [otpalertshow, setOtpAlertshow] = useState(false);
  const [validOtp, setValidOtp] = useState(false);
  const [sucshow, setSucShow] = useState(false);
  const [otpver, setOtpver] = useState(false);
  const [otp, setOtp] = useState('');
  const [validated, setValidated] = useState(false);
  const [phoneui, setPhoneUi] = useState('');
  const [phone, setPhone] = useState('');
  const [wrongOtp, setWrongOtp] = useState(false);
  const phoneNumber = '+91' + phone;
  const navigate = useNavigate();
  const state = useSelector((stateR) => stateR.UserReducer);
  const dispatch = useDispatch();
  const { buttonTracker } = useAnalyticsEventTracker();
  const [img, setImg] = useState(null);

  function formatPhoneNumber(x) {
    const formated = x.replace(/\D+/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    return formated;
  }
  const setPhoneFormat = (value) => {
    const formattedPhoneNumber = formatPhoneNumber(value);
    setPhoneUi(formattedPhoneNumber);
    setPhone(value);
  };

  useEffect(() => {
    if (user.mobileNumber) {
      setPhoneFormat(user.mobileNumber);
    }
    const timeId = setTimeout(() => {
      setShowAlert(false);
      setSucShow(false);
      setOtpAlertshow(false);
    }, 5000);
    return () => {
      clearTimeout(timeId);
    };
  }, []);

  const generateRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      'mobile-number-button',
      {
        size: 'invisible',
        callback: () => {},
      },
      authentication,
    );
  };

  const requestotp = () => {
    if (phone.length === 10) {
      setToogle(true);
      !appVerifier && generateRecaptcha();
      const appRecaptchaVerifier = window.recaptchaVerifier;
      setAppVerifier(appRecaptchaVerifier);
      signInWithPhoneNumber(authentication, phoneNumber, appRecaptchaVerifier)
        .then((confirmationResult) => {
          window.confirmationResult = confirmationResult;
          setVarient('success');
          setOtpAlertshow(true);
          setTimeout(() => {
            setOtpAlertshow(false);
          }, 5000);
        })
        .catch(() => {
          setVarient('danger');
          setOtpAlertshow(true);
          setTimeout(() => {
            setOtpAlertshow(false);
          }, 5000);
        });
    } else {
      setPhoneValid(true);
    }
  };

  const verifyotp = (e) => {
    const userOtp = e.target.value;
    setOtp(userOtp);
    if (userOtp.length === 6) {
      setValidOtp(false);
      const { confirmationResult } = window;
      confirmationResult
        .confirm(userOtp)
        .then(() => {
          setWrongOtp(false);
          setSucShow(true);
          setTimeout(() => {
            setSucShow(false);
          }, 5000);
          setOtpver(true);
          setOtpAlertshow(false);
        })
        .catch(() => {
          setWrongOtp(true);
          setAlertVarient('danger');
          setShowAlert(true);
          setAlertMessage('Invalid OTP');
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
        });
    } else {
      setValidOtp(true);
    }
  };

  const handleAlertClose = () => {
    setOtpAlertshow(false);
  };

  const phoneChange = (event) => {
    setPhoneValid(event.target.value.length !== 10);
    setPhoneFormat(event.target.value);
  };

  const updateUserDetails = async (userDetails) => {
    const { 0: status, 1: data } = await fetchCall(APIUrlConstants.UPDATE_PROFILE, apiMethods.POST, userDetails);
    const statusCode = status;
    const responseData = data;

    if (statusCode === httpStatusCode.SUCCESS) {
      setAlertMessage('Profile updated successfully');
      setShowAlert(true);
      setAlertVarient('success');
      setUser((prevState) => ({
        ...prevState,
        firstName: responseData.data.firstName,
        lastName: responseData.data.lastName,
        emailId: responseData.data.orgEmail,
        mobileNumber: responseData.data.mobileNumber,
        orgName: responseData.data.organization,
      }));
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...user,
          firstName: responseData.data.firstName,
          lastName: responseData.data.lastName,
          emailId: responseData.data.orgEmail,
          mobileNumber: responseData.data.mobileNumber,
          orgName: responseData.data.organization,
        }),
      );
      localStorage.setItem('firstName', responseData.data.firstName);
      localStorage.setItem('lastName', responseData.data.lastName);
      localStorage.setItem('email', responseData.data.orgEmail);
      localStorage.setItem('mobile', responseData.data.mobileNumber);
      localStorage.setItem('orgName', responseData.data.organization);
      dispatch(
        updateUser({
          ...state.user,
          firstName: responseData.data.firstName,
          lastName: responseData.data.lastName,
          orgEmail: responseData.data.orgEmail,
          mobileNumber: responseData.data.mobileNumber,
          orgName: responseData.data.organization,
        }),
      );
      setIsLoading(false);
      setOtp('');
      setTimeout(() => {
        closeAlert();
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
    setIsEditable(false);
  };

  const handleSubmit = async () => {
    if (user.firstName.length > 0 && user.lastName.length > 0 && user.mobileNumber) {
      setIsLoading(true);
      const userNumber = user.mobileNumber;
      const userDetails = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        primaryPhone: userNumber,
        orgName: user.orgName,
      };

      if (userNumber !== phone) {
        if (otpver === true) {
          userDetails.mobileVerify = true;
          userDetails.primaryPhone = phone;
          updateUserDetails(userDetails);
        } else {
          setIsLoading(false);
          setPhonever(true);
        }
      } else {
        updateUserDetails(userDetails);
      }
    }

    setValidated(true);
  };

  const editButton=()=>{
    setIsEditable(true);
    ReactGA.send({ hitType: 'pageview', page: `/editprofile/${localStorage.getItem('id')}` });
    buttonTracker(gaEvents.ENABLE_EDIT_USER);
  }

  const cancelButton=()=>{
    if (roleId === userRoleId.signetAdmin) {
      buttonTracker(gaEvents.NAVIGATE_USERS_LIST);
      navigate('/users');
    } else {
      buttonTracker(gaEvents.NAVIGATE_TICKETS_LIST);
      navigate('/tickets');
    }
  }

  const submitButton=()=>{
    buttonTracker(gaEvents.UPDATE_PROFILE_DETAILS);
    handleSubmit();
  }

  const onImageChange = (e) => {
    const [file] = e.target.files;
    setImg(URL.createObjectURL(file));
  };

  const{firstName}=user
  const{lastName}=user
  const{emailId}=user
  const{orgName}=user

  
  return (
    <Container fluid className="signUpWrapper">
      {showAlert && (
        <Alerts
          variant={alertVarient}
          onClose={() => {
            setShowAlert(false);
          }}
          alertshow={alertMessage}
        />
      )}

      <Alert
        variant="success"
        show={sucshow}
        dismissible
        className="alertWrapper"
        onClick={() => {
          setSucShow(false);
        }}
      >
        <p>OTP Verified</p>
      </Alert>

      <Alert variant={variant} show={otpalertshow} dismissible className="alertWrapper" onClick={handleAlertClose}>
        <p>{variant === 'success' ? 'OTP sent to your mobile number' : 'something went worng '}</p>
      </Alert>
      <div className="wrapperBase baseBg">
        <div className="wrapperCard">
          {isLoading && <Loading />}
          <div className="wrapperCard--body">
            <div>
              <div className="titleHeader">
                <div className="info">
                  <h6>Profile</h6>
                </div>
              </div>

              <div className="row">
                <div className="col-4">
                  <div className="text-center profile-container">
                    <img className="profile-img" src={img === null ? '/images/users/avatar.png' : img} alt="profile" />
                  </div>
                  <div>
                    <p className="text-center">
                      <b>
                        {user.firstName} {user.lastName}
                      </b>
                    </p>
                  </div>
                  {!isEditable ? ' ' : <input type="file" onChange={onImageChange} />}
                </div>

                <div className="col-8">
                  <div className="row">
                    <div className="col-6">
                      <Form noValidate validated={validated} className="fromWrap">
                        <div className="mb-3 input-group input-container">
                          <Form.Group controlId="formFirstName">
                            <Form.Label>
                              <b>First Name</b>{' '}
                            </Form.Label>
                            {!isEditable ? (
                              <p>{firstName}</p>
                            ) : (
                              <Form.Control
                                required
                                pattern="^[a-zA-Z0-9]+$"
                                type="text"
                                placeholder="First Name"
                                autoComplete="off"
                                value={firstName}
                                onChange={(e) => {
                                  setUser((prevState) => ({ ...prevState, firstName: e.target.value }));
                                }}
                              />
                            )}
                            <Form.Control.Feedback type="invalid">Enter a valid First Name</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                        <div>
                          <Form.Label>
                            <b>Organization Email</b>
                          </Form.Label>
                          {!isEditable ? (
                            <p>{emailId}</p>
                          ) : (
                            <Form.Group controlId="formSecondaryEmail" className="inputHolder">
                              <Form.Control placeholder="Organization Email" type="text" value={emailId} readOnly />
                            </Form.Group>
                          )}
                        </div>
                        <div>
                          <Form.Label>
                            <b>Phone Number</b>
                          </Form.Label>
                          {!isEditable ? (
                            <p>{phoneui}</p>
                          ) : (
                            <div className="d-flex  align-items-start w-100 customVerifyBox">
                              <Form.Group controlId="formMobileNumber" className="inputHolder" style={{ width: '265px' }}>
                                <Form.Control
                                  required
                                  pattern="^\(\d{3}\)\s\d{3}-\d{4}"
                                  type="text"
                                  placeholder="Phone Number"
                                  autoComplete="off"
                                  value={phoneui}
                                  onChange={phoneChange}
                                  // readOnly={!isEditable}
                                />
                                {isEditable && validPhone === true ? (
                                  <Form.Control.Feedback type="invalid" data-testid="phonerr">
                                    Enter a valid Phone Number
                                  </Form.Control.Feedback>
                                ) : null}
                                {isEditable && phoneVer === true ? (
                                  <Form.Control.Feedback type="invalid" className="errorColor">
                                    Verify Phone Number
                                  </Form.Control.Feedback>
                                ) : null}
                              </Form.Group>
                              {!toogle && isEditable && (
                                <Button
                                  className="verifyBtn"
                                  variant="primary"
                                  onClick={() => {
                                    requestotp();
                                    buttonTracker(gaEvents.SEND_OTP);
                                  }}
                                  style={{ height: '60px' }}
                                  data-testid="verifybtn"
                                >
                                  <img src={process.env.REACT_APP_PUBLIC_URL + 'images/login/verify.svg'} alt="" /> Verify
                                </Button>
                              )}

                              {toogle && isEditable && (
                                <Form.Group controlId="formOtp" className="inputHolder otpGap">
                                  <Form.Control
                                    required
                                    type="text"
                                    placeholder="OTP Number"
                                    autoComplete="off"
                                    value={otp}
                                    onChange={verifyotp}
                                    isInvalid={validOtp || wrongOtp}
                                  />
                                  <div className="d-flex flex-row-reverse align-items-center widthFull">
                                    <Button
                                      className="resendText d-flex justify-content-end"
                                      onClick={() => {
                                        requestotp();
                                        buttonTracker(gaEvents.RESEND_OTP);
                                      }}
                                    >
                                      Resend OTP
                                    </Button>
                                    {validOtp === true ? <p className="otpError">Enter a valid OTP</p> : null}
                                  </div>
                                </Form.Group>
                              )}
                            </div>
                          )}
                        </div>
                      </Form>
                    </div>

                    <div className="col-6">
                      <Form noValidate validated={validated} className="fromWrap">
                        <div>
                          <Form.Label>
                            <b>Last Name</b>{' '}
                          </Form.Label>
                          {!isEditable ? (
                            <p>{lastName}</p>
                          ) : (
                            <Form.Group controlId="formLastName" className="inputHolder">
                              <Form.Control
                                required
                                pattern="^[a-zA-Z0-9]+$"
                                type="text"
                                placeholder="Last Name"
                                autoComplete="off"
                                value={lastName}
                                onChange={(e) => {
                                  setUser((prevState) => ({ ...prevState, lastName: e.target.value }));
                                }}
                                // readOnly={!isEditable}
                              />
                              <Form.Control.Feedback type="invalid">Enter a valid Last Name</Form.Control.Feedback>
                            </Form.Group>
                          )}
                        </div>
                        <div>
                          <Form.Label>
                            <b>Organization Name</b>
                          </Form.Label>
                          {!isEditable ? (
                            <p>{orgName}</p>
                          ) : (
                            <Form.Group controlId="formOrganization" className="inputHolder">
                              <Form.Control placeholder="Organization Name" type="text" value={user.orgName} readOnly />
                            </Form.Group>
                          )}
                        </div>
                      </Form>
                    </div>
                  </div>
                  <div id="mobile-number-button" />
                </div>
              </div>
              <div className="text-center">
                {!isEditable ? (
                  <Button
                    onClick={editButton }
                    className="buttonPrimary mb-5 mt-4"
                  >
                    {' '}
                    Edit
                  </Button>
                ) : (
                  <div className="profile-buttons">
                    <div className="profile-cancel">
                      <Button
                        onClick={cancelButton}
                        className="buttonPrimary mb-5 mt-4"
                      >
                        {' '}
                        Cancel
                      </Button>
                    </div>
                    <Button
                      onClick={submitButton}
                      className="buttonPrimary mb-5 mt-4"
                    >
                      {' '}
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
