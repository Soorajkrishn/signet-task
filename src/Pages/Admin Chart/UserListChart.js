import React, { useEffect, useState } from 'react';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { makeRequest } from '../../Services/APIService';
import { gaEvents, httpStatusCode } from '../../Constants/TextConstants';
import { Doughnut } from 'react-chartjs-2';
import { Row, Col, Table, Button } from 'react-bootstrap';
import Loading from '../Widgets/Loading';
import { randomColorForCharts } from '../../Utilities/AppUtilities';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useNavigate } from 'react-router-dom';
import useAnalyticsEventTracker from '../../Hooks/useAnalyticsEventTracker';
import './UserListChart.css';

function Statistics() {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUser] = useState([]);
  const [org, setOrg] = useState('');
  const { buttonTracker } = useAnalyticsEventTracker();
  const history = useNavigate();
  const activeUsers = [];
  const inActiveUsers = [];
  const pendingUsers = [];

  const fetchAllUserDetails = async () => {
    setIsLoading(true);
    const { 0: statusCode, 1: data } = await makeRequest(APIUrlConstants.FETCH_USER_DETAILS);
    if (statusCode === httpStatusCode.SUCCESS) {
      setIsLoading(false);
    }
    setUser(data.data);
    setOrg(data.data[0].organization);
  };
  const totalUsers = users.length;

  users.map((v) => {
    if (v.status === 'Active') {
      activeUsers.push(v);
    } else if (v.status === 'Inactive') {
      inActiveUsers.push(v);
    } else if (v.status === 'Pending') {
      pendingUsers.push(v);
    }
    return true;
  });

  const totalActiveUsers = activeUsers.length;

  const totalInactiveUsers = inActiveUsers.length;

  const totalPendingUsers = pendingUsers.length;

  const handleClick = (id) => {
    buttonTracker(gaEvents.NAVIGATE_EDIT_USER);
    history(`/edituser/${id}`);
  };

  const options = {
    responsive: true,
    plugins: {
      ChartDataLabels,
      datalabels: {
        display: true,
        formatter: (value) => value,
        color: 'white',
        font: {
          size: 12,
          weight: 'bold',
        },
      },
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        },
      },
    },
  };

  const labels = ['Active Users', 'Inactive Users', 'Pending Users'];
  const values = [totalActiveUsers, totalInactiveUsers, totalPendingUsers];

  const dataValues = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: randomColorForCharts(values.length),
      },
    ],
    Option,
  };

  const registeredOrg = users.filter((ele, int) => int === users.findIndex((val) => val.organization === ele.organization));
  const filterUsers = users.filter((each) => each.organization === org);

  useEffect(() => {
    fetchAllUserDetails();
  }, []);

  return (
    <>
      {isLoading && <Loading />}
      <div className="wrapperBase">
        {isLoading ? (
          'Loading'
        ) : (
          <>
            <Row>
              <Col lg={4} md={12} sm={12} xs={12}>
                <div className="cardWrapper">
                  <div className="cardHeader d-flex align-items-center justify-content-between">
                    <h6>Total Number Of Users</h6>
                  </div>
                  <div className="imageWrapper">
                    <img className="imagecontainer" alt="" src="/images/tasks/users.png" />
                  </div>
                  <h5>
                    Number of Users : <b>{totalUsers}</b>
                  </h5>
                </div>
              </Col>
              <Col lg={4} md={12} sm={12} xs={12}>
                <div className="cardWrapper">
                  <div className="cardHeader d-flex align-items-center justify-content-between">
                    <h6>User Status</h6>
                  </div>
                  <div className="imageWrapper">
                    <Doughnut data={dataValues} options={options} />
                  </div>
                </div>
              </Col>
              <Col lg={4} md={12} sm={12} xs={12}>
                <div className="cardWrapper">
                  <div className="cardHeader d-flex align-items-center justify-content-between">
                    <h6>Total Number Of Organization</h6>
                  </div>
                  <div className="imageWrapper">
                    <img className="imagecontainer" alt="" src="/images/tasks/building.jpg" />
                  </div>
                  <h5>
                    Number of Organization : <b>{registeredOrg.length}</b>
                  </h5>
                </div>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={4} sm={12} xs={12}>
                <Table bordered className="tableBackground">
                  <thead>
                    <tr>
                      <td>
                        <b>Organizations Name</b>
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredOrg.map((v) => (
                      <tr key={v.organization} onClick={() => setOrg(v.organization)}>
                        <td>{v.organization !== null ? v.organization : 'Others'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
              <Col md={8} sm={12} xs={12}>
                <Table bordered className="tableBackground">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>User Organization</th>
                      <th>User Email</th>
                    </tr>
                  </thead>
                  {filterUsers.map((v) => (
                    <tbody>
                      <tr key={v.userId}>
                        <td>
                          <Button variant="link" onClick={() => handleClick(v.userId)}>
                            {v.firstName}
                          </Button>
                        </td>
                        <td>{v.organization}</td>
                        <td>{v.orgEmail}</td>
                      </tr>
                    </tbody>
                  ))}
                </Table>
              </Col>
            </Row>
          </>
        )}
      </div>
    </>
  );
}

export default Statistics;
