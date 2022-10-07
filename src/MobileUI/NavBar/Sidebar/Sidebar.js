import React, { useEffect, useState } from "react";
import { useTheme } from "../../../Context/MenuContext";
import './Sidebar.css'

function MoblieSidebar(){
    const sidebarOpen = useTheme();
    const [user,seruser]=useState([])

    useEffect(()=>{
        const userData= JSON.parse(localStorage.getItem('user'))
        seruser(userData)
    },[])
    

    return (
            <div className={'sidebarBox ' + (sidebarOpen ? 'showSidebar' : 'hideSidebar')}>
                <div className="flex-column d-flex align-items-center bgColor">
                    <div >
                        <img alt="fd" src="/images/tasks/logo192.png"/>
                    </div>
                    <div>
                        <h6>{user?.firstName} {user?.lastName}</h6>
                        <h6>{user?.emailId}</h6>
                    </div>
                </div>
            </div>
    )

}

export default MoblieSidebar