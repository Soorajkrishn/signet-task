import React,{ useState,useEffect}  from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { randomColorForCharts } from '../Utilities/AppUtilities';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function HorizontalBarChart({ data }) {
  const [labels,setLabels]=useState('')
  const [values,setValues]=useState('')
  console.log(data)
  const options = {
    indexAxis: 'y',
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      x: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'System Types',
        position: 'left',
      },
    },
  };

useEffect(()=>{
 if(data.system?.systemCapacityDTOs){
    const tempLabel=[]
    const tempValue=[]
    data.system?.systemCapacityDTOs?.forEach((sys) => {
      tempLabel.push(sys.key.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase()));
      tempValue.push(parseFloat(sys.capacity).toFixed(2));
  });
  setLabels(tempLabel)
  setValues(tempValue)
  }else{
    setLabels(data?.label) 
    setValues(data?.value) 
  }
},[])
 
  
  
console.log(data.label)
  const dataValues = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: randomColorForCharts(values.length),
      },
    ],
  };

  return <Bar options={options} data={dataValues} />;
}

export default HorizontalBarChart;
