import React from "react";
import Chart from "react-google-charts";

export default function TreeMapChart() {
    const data = [
        [
            
            "problem",
            "Parent",
            "Market trade volume (size)",
            "colors"
        ],
        ["Tickets", null, 0,0],
        ["System Trouble","Tickets" ,537,-2],
        ["Test & Inspection","Tickets" , 235,1],
        ["MAC","Tickets" , 118,2],
        ["Survey","Tickets" , 69,3],
        ["Remote Smart","Tickets" , 43,4],
        ["After Hours","Tickets" , 33,5],
        ["Parts Order","Tickets" , 17,6],
        ["System Upgrade","Tickets" , 15,7],
        ["Activity Report","Tickets" , 9,8],
        ["Parts Repair","Tickets" , 9,9],
        ["Client Training","Tickets" , 4,10],
        ["(empty)","Tickets" , 3,11 ],
        ["Business Review","Tickets" , 3,12],
        ["Deficiency Repair","Tickets" , 2,13],
        ["Disconnect/Reconnect","Tickets" , 1,14],
        ["Other","Tickets" , 1,15],

    ];
    return (
        <Chart chartType="TreeMap" data={data} />
    )
}
