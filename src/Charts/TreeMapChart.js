import React, { useEffect, useState } from 'react';
import Chart from 'react-google-charts';

export default function TreeMapChart(dataSet) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const temp = [
      ['problem', 'Parent', 'Market trade volume (size)', 'color'],
      ['Tickets', null, 0, 0],
    ];
    const { data: datasetdata = [] } = dataSet;

    datasetdata.map(({ key, problem }, index) => temp.push([key, 'Tickets', problem, index]));
    setData(temp);
  }, []);

  const options = {
    minColor: '#16216C',
    midColor: '#F0F8FF',
    maxColor: '#0000CD',
    headerHeight: 0,
    fontColor: 'white',
    fontSize: 12,
  };
  return <Chart chartType="TreeMap" data={data} options={options} />;
}
