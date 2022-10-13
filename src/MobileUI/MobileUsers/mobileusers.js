import React, { useEffect, useState } from 'react';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { httpStatusCode } from '../../Constants/TextConstants';
import Loading from '../../Pages/Widgets/Loading';
import { makeRequest } from '../../Services/APIService';
import Navigation from '../NavBar/Navbar';
import { useNavigate } from 'react-router-dom';
import './mobileUsers.css';

export default function MobileUsers() {
  const [user, setUser] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sliceTicket, setSliceTicket] = useState([]);
  const [page, setPage] = useState(1);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(10);
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  const fetchAllUserDetails = async () => {
    setIsLoading(true);
    const { 0: statusCode, 1: data } = await makeRequest(APIUrlConstants.FETCH_USER_DETAILS);
    if (statusCode === httpStatusCode.SUCCESS) {
      setIsLoading(false);
    }
    setUser(data.data);
  };
  useEffect(() => {
    fetchAllUserDetails();
  }, []);

  const pageNo = Math.ceil(user.length / 10);
  console.log(pageNo);

  const view = () => {
    setTimeout(() => {
      if (page <= pageNo) {
        setPage(page + 1);
        setStart(start + 10);
        setEnd(end + 10);
        const tempSlice = user?.slice(start, end);
        const temp = sliceTicket + tempSlice;
        setSliceTicket(temp);
        setLoader(false);
      }
    }, 1500);
  };

  window.onscroll = () => {
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 2) {
      if (page <= pageNo) {
        setLoader(true);
        view();
      }
    }
  };

  useEffect(() => {
    if (user.length > 10) {
      const tempTicket = user?.slice(start, end);
      setSliceTicket(tempTicket);
    } else {
      setSliceTicket(user);
    }
  }, [user]);
  return (
    <>
      {isLoading && <Loading />}
      {loader && <Loading />}
      <Navigation />
      <div className="wrapperBase">
        <ul>
          {sliceTicket.map((v) => (
            <li className="userList" key={v.userId}>
              <p>
                <b>Name : </b>
                {v.firstName} {v.lastName}
              </p>
              <p>
                <b>Status : </b>
                {v.status}
              </p>
              <p>
                <b>Mobile : </b>
                {v.mobileNumber}
              </p>
              <p>
                <b>Organization : </b>
                {v.organization}
              </p>
            </li>
          ))}
        </ul>
        <div>
          <img src="/images/tasks/plus.svg" alt="" />
        </div>
      </div>
    </>
  );
}
