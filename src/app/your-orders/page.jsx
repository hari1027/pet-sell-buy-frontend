"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import UpdatePet from "./updatePet";
import NotificationBar from "../NotificationBar"
import LoadingScreen from "../LoadingScreen"

const TableComponent = () => {
  const [data, setData] = useState([]);
  const router = useRouter();
  const [singleData , setSingleData] = useState(null)
  const [singleDataScreen , setSingleDataScreen] = useState(false)
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });

  const showNotification = (msg, type) => {
    setNotification({ message: msg, type, show: true });
    setTimeout(() => setNotification({ ...notification, show: false }), 5000);
  };

  useEffect(() => {
  
  async function fetchData () {  
  setLoading(true)
   try{
    const endpoint = 'https://pet-sell-buy.onrender.com/graphql';
    const query = `
    query {
      listPetsOnSale {
        id
        type
        numbers
        breed
        gender
        age
        price
        interestedBy
        images{
          url , name
        }
        medicalRecords{
           url , name
        }
        ownerId
      }
    }
  `;
    
    const response = await axios.post(endpoint, { query }, { headers: { "Content-Type": "application/json" } });
    if(response.data.errors){
      console.error("Error in fetching pets details")
      showNotification("Error in fetching pets details", "error");
      setLoading(false)
    }else{
      let userData = JSON.parse(localStorage.getItem("userDetails"))
      let filteredData = response.data.data.listPetsOnSale.filter((data)=>(
        data.ownerId === userData.id
      ))
      setData(filteredData)
      setLoading(false)
    }
   } catch(error){
      console.error("Error occured while fetching pet details" , error)
      showNotification("Error occured while fetching pet details", "error");
      setLoading(false)
   }
  }
  fetchData()
  }, []);

  const handleRowClick = (id) => {
    const filterSpecificId = data.filter((item) => {
      return(
        id === item.id
      )
    })
    setSingleData(filterSpecificId[0])
    setSingleDataScreen(true)
  };

  return (
      <div>
    {!singleDataScreen &&
    <div className="flex items-center justify-center min-h-screen h-full p-8 bg-fuchsia-100 flex-col">
       <h2 className="text-2xl font-bold mb-6 text-center">Your Orders</h2>

      {data.length > 0 ?
      <TableContainer component={Paper}>
        <Table className="bg-lime-200 border-2">
          <TableHead>
            <TableRow>
              <TableCell sx={{fontWeight:"700"}} className="bg-blue-400 border-2">ID</TableCell>
              <TableCell sx={{fontWeight:"700"}} className="bg-blue-400 ">Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}
               onClick={() => handleRowClick(item.id)} style={{ cursor: "pointer" }}
               >
                <TableCell className="border-2" sx={{fontWeight:"700"}}>{item.id}</TableCell>
                <TableCell className="border-2" sx={{fontWeight:"700"}}>{item.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> :
       <div className="font-semibold mb-6 text-center">No data Available </div>
      }
      <button type="button" className="w-30 p-3 mt-4 bg-blue-400 text-white rounded-2xl shadow-lg hover:bg-blue-500 transition duration-300 cursor-pointer" disabled={loading} onClick={() => router.push("/dashboard")}>Back</button>
    </div>
   }
   {singleDataScreen &&
      <UpdatePet pet={singleData} onBack={() => setSingleDataScreen(false)} />
   }
   {notification.show && (
        <NotificationBar
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}
    {loading && <LoadingScreen />}
  </div>
  );
};

export default TableComponent;
