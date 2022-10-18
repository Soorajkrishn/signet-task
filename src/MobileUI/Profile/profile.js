import React, { useEffect, useState } from 'react';
import './profile.css';
import { randomColor } from '../../Utilities/AppUtilities';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Alert } from 'react-bootstrap';
import { apiMethods, gaEvents, httpStatusCode } from '../../Constants/TextConstants';
import { fetchCall } from '../../Services/APIService';
import { authentication } from '../../Config/FirebaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import useAnalyticsEventTracker from '../../Hooks/useAnalyticsEventTracker';
import Alerts from '../../Pages/Widgets/Alerts';
import { removeEditProfile, updateUser } from '../../Redux/Actions/Actions';
import APIUrlConstants from '../../Config/APIUrlConstants';

export default function MobileProfile() {
  const [user, setUser] = useState([]);
  const [phoneui, setPhoneUi] = useState('');
  const [phone, setPhone] = useState('');
  const [wrongOtp, setWrongOtp] = useState(false);
  const phoneNumber = '+91' + phone;
  const [validPhone, setPhoneValid] = useState(false);
  const [phoneVer, setPhonever] = useState(false);
  const [toogle, setToogle] = useState(false);
  const [otpalertshow, setOtpAlertshow] = useState(false);
  const [validOtp, setValidOtp] = useState(false);
  const [sucshow, setSucShow] = useState(false);
  const [otpver, setOtpver] = useState(false);
  const [otp, setOtp] = useState('');
  const [appVerifier, setAppVerifier] = useState(null);
  const [variant, setVarient] = useState('');
  const { buttonTracker } = useAnalyticsEventTracker();
  const [alertVarient, setAlertVarient] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const closeAlert = () => setShowAlert(false);
  const [validated, setValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const userProfile = useSelector((state) => state.MoblieuiReducer);
  const dispatch = useDispatch();
  const state = useSelector((stateR) => stateR.UserReducer);
  useEffect(() => {
    const temp = JSON.parse(localStorage.getItem('user'));
    setUser(temp);
  }, []);

  const avatar = `${user?.firstName?.trim().charAt(0)} ${user?.lastName?.trim().charAt(0)}`;

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
    if (user?.mobileNumber) {
      setPhoneFormat(user?.mobileNumber);
    }
    const timeId = setTimeout(() => {
      setShowAlert(false);
      setSucShow(false);
      setOtpAlertshow(false);
    }, 5000);
    return () => {
      clearTimeout(timeId);
    };
  }, [user]);

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

  const submitButton = () => {
    buttonTracker(gaEvents.UPDATE_PROFILE_DETAILS);
    handleSubmit();
  };

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

  const phoneChange = (event) => {
    setPhoneValid(event.target.value.length !== 10);
    setPhoneFormat(event.target.value);
  };
  const handleAlertClose = () => {
    setOtpAlertshow(false);
  };
  const cancelButton = () => {
    dispatch(removeEditProfile('Profile'));
    setToogle(false);
  };
  return (
    <>
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
      <div className=" mt-3 profileWrapper d-flex align-items-center justify-content-center">
        <div
          className="avatar profileAvatar text-capitalize d-flex align-items-center justify-content-center"
          style={{ backgroundColor: randomColor }}
        >
          {avatar}
        </div>

        <div className="mt-2">
          <p>
            <b>
              {user?.firstName} {user?.lastName}
            </b>
          </p>
        </div>
      </div>
      <div className="container">
        <Form noValidate validated={validated} className="fromWrap">
          <label>
            <b>First Name</b>
          </label>
          {userProfile.profileEdit ? (
            <Form.Control
              required
              pattern="^[a-zA-Z0-9]+$"
              type="text"
              placeholder="First Name"
              autoComplete="off"
              value={user?.firstName}
              onChange={(e) => {
                setUser((prevState) => ({ ...prevState, firstName: e.target.value }));
              }}
            />
          ) : (
            <div className="textContainer">
              <p>{user?.firstName}</p>
            </div>
          )}
          <label>
            <b>Last Name</b>
          </label>
          {userProfile.profileEdit ? (
            <Form.Control
              required
              pattern="^[a-zA-Z0-9]+$"
              type="text"
              placeholder="First Name"
              autoComplete="off"
              value={user?.lastName}
              onChange={(e) => {
                setUser((prevState) => ({ ...prevState, lastName: e.target.value }));
              }}
            />
          ) : (
            <div className="textContainer">
              <p>{user?.lastName}</p>
            </div>
          )}
          <label>
            <b>Phone Number</b>
          </label>
          {userProfile.profileEdit ? (
            <div className="d-flex  align-items-start w-100 customVerifyBox">
              <Form.Group controlId="formMobileNumber" className="inputHolder w-75">
                <Form.Control
                  required
                  pattern="^\(\d{3}\)\s\d{3}-\d{4}"
                  type="text"
                  placeholder="Phone Number"
                  autoComplete="off"
                  value={phoneui}
                  onChange={phoneChange}
                />
                {userProfile.profileEdit && validPhone === true ? (
                  <Form.Control.Feedback type="invalid" data-userProfileid="phonerr">
                    Enter a valid Phone Number
                  </Form.Control.Feedback>
                ) : null}
                {userProfile.profileEdit && phoneVer === true ? (
                  <Form.Control.Feedback type="invalid" className="errorColor">
                    Verify Phone Number
                  </Form.Control.Feedback>
                ) : null}
              </Form.Group>
              {!toogle && userProfile.profileEdit && (
                <Button
                  className="verifyBtn w-15"
                  variant="primary"
                  onClick={() => {
                    requestotp();
                    buttonTracker(gaEvents.SEND_OTP);
                  }}
                  style={{ height: '60px' }}
                  data-userprofileid="verifybtn"
                >
                  <img src={process.env.REACT_APP_PUBLIC_URL + 'images/login/verify.svg'} alt="" /> Verify
                </Button>
              )}

              {toogle && userProfile.profileEdit && (
                <Form.Group controlId="formOtp" className="inputHolder">
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
          ) : (
            <div className="textContainer">
              <p>{phoneui}</p>
            </div>
          )}
          <label>
            <b>Organization</b>
          </label>
          {userProfile.profileEdit ? (
            <Form.Group controlId="formOrganization" className="inputHolder">
              <Form.Control placeholder="Organization Name" type="text" value={user?.orgName} readOnly />
            </Form.Group>
          ) : (
            <div className="textContainer">
              <p>{user?.orgName}</p>
            </div>
          )}
          <label>
            <b>Organization Emil</b>
          </label>
          {userProfile.profileEdit ? (
            <Form.Group controlId="formSecondaryEmail" className="inputHolder">
              <Form.Control placeholder="Organization Email" type="text" value={user?.emailId} readOnly />
            </Form.Group>
          ) : (
            <div className="textContainer">
              <p>{user?.emailId}</p>
            </div>
          )}
        </Form>
        <div id="mobile-number-button" />
        {userProfile.profileEdit && (
          <div className="d-flex align-items-center justify-content-center container w-75">
            <Button onClick={cancelButton} className="buttonPrimary mb-5 mt-4 mr-1">
              {' '}
              Cancel
            </Button>

            <Button onClick={submitButton} className="buttonPrimary mb-5 mt-4">
              {' '}
              Save
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
