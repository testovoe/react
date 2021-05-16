import logo from './logo.svg';
import './App.css';
import { tableIcons } from './icons';
import MaterialTable from 'material-table';
import {useState} from 'react';
import { Chart } from "react-google-charts";
import { rgbToHex } from '@material-ui/core';

function App() {

  return (
    <Layout>
      <Testovoe/>
    </Layout>
  );
}

function Layout(props) {
  return (
    <div>
      <header style={{display:"flex", fontSize: 32, alignContent:"center", padding: "24px 40px", backgroundColor: "#f5f5f5"}}>
        {"AB TEST REAL"}
      </header>
      <div style={{display:'flex'}}>
        
        <div style={{backgroundColor:"#f5f5f5", flex:1}}>
          <p style={{fontSize:32, margin:20}}>Side Menu</p>
        </div>
        <div style={{backgroundColor:"#f5f5f5", flex:9}}>
        {props.children}
        </div>
      </div>
    </div>
  )
}

function Testovoe() {
  const [data, setData] = useState([]);
  const [rollingRetention7DayData, setRollingRetention7DayData] = useState(undefined);
  return (
    <div>
      <MaterialTable
      style = {{margin: 5, border: "2px black", width: "1000px"}}
        icons = { tableIcons }
        options = {{search: false}}
        columns={[
          { title: 'UserID', field: 'userId', type: 'numeric' },
          { title: 'Date Registration', field: 'dateRegistration', type: 'date' },
          { title: 'Date Last Activity', field: 'dateLastActivity', type: 'date' },
        ]}
        data={data}
        title={"User Action Dates"}
        localization={{
          header: {
            actions: ''
          }
        }}
        editable={{
          isEditable: () => true,
          isEditHidden: rowData => false,
          isDeletable: rowData => true,
          isDeleteHidden: rowData => false,
          onRowAddCancelled: rowData => console.log('добавление отменено'),
          onRowUpdateCancelled: rowData => console.log('редактирование отменено'),
          onRowAdd: newData =>
              new Promise((resolve, reject) => {
                    setData([...data, newData]);
                    resolve();
              }),
          onRowUpdate: (newData, oldData) =>
              new Promise((resolve, reject) => {
                    const dataUpdate = [...data];
                    const index = oldData.tableData.id;
                    dataUpdate[index] = newData;
                    setData([...dataUpdate]);

                    resolve();
              }),
          onRowDelete: oldData =>
              new Promise((resolve, reject) => {
                    const dataDelete = [...data];
                    const index = oldData.tableData.id;
                    dataDelete.splice(index, 1);
                    setData([...dataDelete]);
                    resolve();
              })
        }}
        
      />
        <div>
          <button 
          style={{backgroundColor: "blue", fontSize:18, fontWeight: "bold", color: "white", padding:"14px 40px", borderRadius: 12, margin: 5}}
            onClick = {() => {
              if (!data && data.length < 1){
                return;
              }

              const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify(data)
              };
              fetch('http://80.78.244.13:5000/weatherforecast', requestOptions)
                  .then(response => {
                    console.log('Ok');
                    setData([]);
                  }, reject => console.log("error"));
              }
            }
          >
            Save
          </button>
        </div>
        <span style={{ display: 'flex'}}>
          <button
          style={{backgroundColor: "blue", fontSize:18, fontWeight: "bold", color: "white", padding:"14px 40px", borderRadius: 12, margin: 5}}
            onClick = {() => {
              if (!data && data.length < 1){
                return;
              }

              const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({days: 7})
              };
              fetch('http://80.78.244.13:5000/weatherforecast/rollingretention', requestOptions)
              .then( response => response.json())
              .then(resposeData => {setRollingRetention7DayData(resposeData); console.log(resposeData.histogramData)});
              }
            }
            >Calculate
          </button></span>
        { rollingRetention7DayData ?
          <div>
            <span style={{ display: 'flex', margin: 5, fontWeight:"bold", fontSize: "20"}}>Rolling Retention 7 day = {rollingRetention7DayData.rollingRetention}</span>
            <div style={{ display: 'flex'}}>
              <Chart
              style={{margin: 5}}
                width={'500px'}
                height={'300px'}
                chartType="Histogram"
                loader={<div>Loading Chart</div>}
                data={[['LifeDays']].concat(rollingRetention7DayData.histogramData?.map(x => [x.lifeDays]))}
                options={{
                  title: 'User life',
                  legend: { position: 'none' },
                }}
                rootProps={{ 'data-testid': '1' }}
              />
            </div>
          </div> :
          <span></span>
        }
      </div>
  )
}

export default App;
