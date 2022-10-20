import React from "react";
import { TreeMapComponent, Inject, TreeMapLegend, TreeMapTooltip } from '@syncfusion/ej2-react-treemap';

export default function TestChart(){
    const data=[{Problem:"System Trouble",Title:"Tickets" ,count:537},
    {Problem:"Test & Inspection",Title:"Tickets" ,count: 235},
    {Problem:"MAC",Title:"Tickets" , count:118},
    {Problem:"Survey",Title:"Tickets" , count:69},
    {Problem:"Remote Smart",Title:"Tickets" ,count: 43},
    {Problem:"After Hours",Title:"Tickets" ,count: 33},
    {Problem:"Parts Order",Title:"Tickets" ,count: 17},
    {Problem:"System Upgrade",Title:"Tickets" , count:15},
    {Problem:"Activity Report",Title:"Tickets" ,count: 9},
    {Problem:"Parts Repair",Title:"Tickets" , count:9},
    {Problem:"Client Training",Title:"Tickets" ,count: 4},
    {Problem:"(empty)",Title:"Tickets" , count:3},
    {Problem:"Business Review",Title:"Tickets" ,count: 3},
    {Problem:"Deficiency Repair",Title:"Tickets" , count:2},
    {Problem:"Disconnect/Reconnect",Title:"Tickets" , count:1},
    {Problem:"Other",Title:"Tickets" ,count: 1}]
    return(
        <TreeMapComponent tooltipSettings={{visible: true}} dataSource={data}/>
    )
}