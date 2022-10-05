import React,{ useEffect,useState } from "react";
import { gaEvents, httpStatusCode } from '../../Constants/TextConstants';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { makeRequest } from '../../Services/APIService';
import { Table } from "react-bootstrap";
import './ticket.css'

function TicketList(){
    const [ticket,setTicket]=useState([])

    const fetchAllUserDetails = async () => {
        const { 0: statusCode, 1: data } = await makeRequest(
            APIUrlConstants.TICKETS_LIST + `?customerNo=${localStorage.getItem('orgNo')}`,
        );
        if (statusCode === httpStatusCode.SUCCESS) {
            setTicket(data.data);
        }

    }
    useEffect(()=>{
        fetchAllUserDetails()
    },[])

    return(
        <div>
            <Table >
                <tbody>
                    {ticket.map((v)=><tr className="ticketData">
                        <td><p>{v.description}</p>
                        <p>{v.ticketNo}</p></td>
                    </tr>)}
                </tbody>
            </Table>
        </div>
    )
}

export default TicketList