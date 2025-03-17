"use client";

import { useState , useEffect} from "react";
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
import PetDetails from "./petDetails";
import NotificationBar from "../NotificationBar"
import LoadingScreen from "../LoadingScreen"

const ageFilters = [
  { label: "0 - 1", value: [0, 1] },
  { label: "2 - 4", value: [2, 4] },
  { label: "5 - 10", value: [5, 10] },
  { label: "11 - 13", value: [11, 13] },
  { label: "Above 13", value: [14, Infinity] },
];

const priceFilters = [
  { label: "0 - 100", value: [0, 100] },
  { label: "101 - 500", value: [101, 500] },
  { label: "501 - 1000", value: [501, 1000] },
  { label: "1001 - 3000", value: [1001, 3000] },
  { label: "3001 - 5000", value: [3001, 5000] },
  { label: "5001 - 10000", value: [5001, 10000] },
  { label: "10001 - 20000", value: [10001, 20000] },
  { label: "20001 - 30000", value: [20001, 30000] },
  { label: "30001 - 40000", value: [30001, 40000] },
  { label: "40001 - 50000", value: [40001, 50000] },
  { label: "Above 50000", value: [50001,Infinity]}
];

const TableComponent = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    type: null,
    gender: null,
    age: null,
    price: null,
  });
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
        data.ownerId !== userData.id
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

  const handleFilterChange = (filter, value) => {
    if((filter === "age" || filter === "price") && value !== "Any"){
      value = value.split(",")
    }
    setFilters((prev) => ({
      ...prev,
      [filter]: value === "Any" ? null : value, // Convert "Any" to null for easy filtering
    }));
  };
  
  const filteredData = data.filter((item) => {
    return (
      (!filters.type || item.type === filters.type) &&  // ✅ "Any" is treated as null (no filter)
      (!filters.gender || item.gender === filters.gender) &&
      (!filters.age || (Number(item.age) >= Number(filters.age[0]) && Number(item.age) <= (filters.age[1]) )) &&
      (!filters.price || (Number(item.price) >= Number(filters.price[0]) && Number(item.price) <= Number(filters.price[1]) ))
    );
  });

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
          <h2 className="text-2xl font-bold mb-6 text-center">Filter Options</h2>

          <div className="space-y-4 w-full max-w-md mb-10">
          <div>
             <label className="block font-bold text-center mb-2">Type</label>
             <select
               className={`w-full p-3 pl-3 pr-5 border-2 border-black rounded-full appearance-none cursor-pointer`}
               onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="Any" className="text-gray-400">Any</option>
              {["dog", "cat", "bird", "fish", "cow", "hen", "cock", "horse", "rabbit", "pig", "hamster", "turtle"].map((pet) => (
                <option key={pet} value={pet} className="text-black">{pet}</option>
              ))}
            </select>
          </div>

          <div>
             <label className="block font-bold text-center mb-2">Gender</label>
             <select
               className={`w-full p-3 pl-3 pr-5 border-2 border-black rounded-full appearance-none cursor-pointer`}
               onChange={(e) => handleFilterChange("gender", e.target.value)}
            >
              <option value="Any" className="text-gray-400">Any</option>
              {["male" , "female" , "both"].map((pet) => (
                <option key={pet} value={pet} className="text-black">{pet}</option>
              ))}
            </select>
          </div>

          <div>
             <label className="block font-bold text-center mb-2">Age</label>
             <select
               className={`w-full p-3 pl-3 pr-5 border-2 border-black rounded-full appearance-none cursor-pointer`}
               onChange={(e) => handleFilterChange("age", e.target.value)}
            >
              <option value="Any" className="text-gray-400">Any</option>
              {ageFilters.map((pet) => (
                <option key={pet.label} value={pet.value} className="text-black">{pet.label}</option>
              ))}
            </select>
          </div>

          <div>
             <label className="block font-bold text-center mb-2">Price</label>
             <select
               className={`w-full p-3 pl-3 pr-5 border-2 border-black rounded-full appearance-none cursor-pointer`}
               onChange={(e) => handleFilterChange("price", e.target.value)}
            >
              <option value="Any" className="text-gray-400">Any</option>
              {priceFilters.map((pet) => (
                <option key={pet.label} value={pet.value} className="text-black">{pet.label}</option>
              ))}
            </select>
          </div>
        </div>

      {filteredData.length > 0 ?
      <TableContainer component={Paper}>
        <Table className="bg-lime-200 border-2">
          <TableHead>
            <TableRow>
              <TableCell sx={{fontWeight:"700"}} className="bg-blue-400 border-2">ID</TableCell>
              <TableCell sx={{fontWeight:"700"}} className="bg-blue-400 ">Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((item) => (
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
      <PetDetails pet={singleData} onBack={() => setSingleDataScreen(false)} />
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
