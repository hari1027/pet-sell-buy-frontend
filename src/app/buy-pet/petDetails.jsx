import React, { useState , useEffect} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import NotificationBar from "../NotificationBar"
import LoadingScreen from "../LoadingScreen"

const PetDetails = ({ pet, onBack }) => {

  const [ownerDetails , setOwnerDetails] = useState({
    email : null,
    mobileNumber : null,
    address : null
  })

  const router = useRouter();
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
      mutation {
        getUserDetails (
         id: "${pet.ownerId}"
       ){
          email,
          mobileNumber,
          address,
         }
      }
    `;
      
      const response = await axios.post(endpoint, { query }, { headers: { "Content-Type": "application/json" } });
      if(response.data.errors){
        console.error("Error in fetching owner details")
        showNotification("Error in fetching owner details", "error");
        setLoading(false)
      }else{
        setOwnerDetails(response.data.data.getUserDetails)
        setLoading(false)
      }
     } catch(error){
        console.error("Error occured while fetching owner details")
        showNotification("Error occured while fetching owner details", "error");
        setLoading(false)
     }
    }
    fetchData()
  }, []);

  const showInterest = async () => {
    setLoading(true)
    try {
      const endpoint = "https://pet-sell-buy.onrender.com/graphql"; 

      const query = `
        mutation {
          showInterest(
            id: "${pet.id}",
            email: "${ownerDetails.email}"
          ) 
        }
      `;

      const response = await axios.post(endpoint, { query }, { headers: { "Content-Type": "application/json" } });

      if (response.data.errors) {
          console.error("Failed to add interest. Try again.");
          showNotification("Failed to add interest. Try again.", "error");
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error to add interest" , error);
      showNotification("Error to add interest", "error");
    } finally {
      setLoading(false);
    }
  }

  const removeInterest = async () => {
    setLoading(true)
    try {
      const endpoint = "https://pet-sell-buy.onrender.com/graphql"; 

      const query = `
        mutation {
          removeInterest(
            id: "${pet.id}",
            email: "${ownerDetails.email}"
          ) 
        }
      `;

      const response = await axios.post(endpoint, { query }, { headers: { "Content-Type": "application/json" } });

      if (response.data.errors) {
          console.error("Failed to remove interest. Try again.");
          showNotification("Failed to remove interest. Try again.", "error");
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error to remove interest" ,error);
      showNotification("Error to remove interest", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!pet) return null;

  return (
    <div className="flex justify-center min-h-screen h-full p-8 bg-fuchsia-100 flex-col items-center">
        <h2 className="text-2xl font-bold text-center mb-4">Pet Details</h2>
        <div className="border-2 p-2 rounded-lg w-full">
          {[
            { label: "Type", value: pet.type },
            { label: "Breed", value: pet.breed },
            { label: "Gender", value: pet.gender },
            { label: "Age", value: pet.age },
            { label: "Price", value: pet.price},
            { label: "Numbers Available", value: pet.numbers },
            // { label: "Email", value: ownerDetails.email },
            { label: "Contact Number", value: ownerDetails.mobileNumber },
            { label: "Address", value: ownerDetails.address },
          ].map((item, index) => (
            <div key={index} className="flex py-2 items-center justify-center">
              <span className="text-black font-bold w-1/2">{item.label}</span>
              <span className="text-blue-400 font-bold break-all w-1/2 ">{item.value || "-"}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center space-y-4 mt-8">
            <h3 className="text-xl font-semibold text-gray-700">Images</h3>
            <div className="w-full flex flex-wrap justify-center gap-4">
              {pet.images?.length > 0 ? (
                pet.images.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt={img.name}
                    className="w-100 h-100 object-cover rounded-lg shadow-md"
                  />
                ))
              ) : (
                <p className="text-gray-500">No images available</p>
              )}
            </div>
        </div>

        <div className="flex flex-col items-center space-y-4 mt-8">
            <h3 className="text-xl font-semibold text-gray-700">Medical Records</h3>
            <div className="w-full flex flex-wrap justify-center gap-4">
              {pet.medicalRecords?.length > 0 ? (
                pet.medicalRecords.map((rec, index) => (
                  <img
                    key={index}
                    src={rec.url}
                    alt={rec.name}
                    className="w-100 h-100 object-cover rounded-lg shadow-md"
                  />
                ))
              ) : (
                <p className="text-gray-500">No medical records available</p>
              )}
            </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button className={`w-30 p-3 ${(pet.interestedBy).includes(ownerDetails.email)? "bg-red-400 hover:bg-red-500" : "bg-green-400 hover:bg-green-500"}  text-white rounded-2xl shadow-lg transition duration-300 cursor-pointer`} disabled={loading} onClick={(pet.interestedBy).includes(ownerDetails.email) ? removeInterest : showInterest} >{loading ? "Updating..." : ((pet.interestedBy).includes(ownerDetails.email)? "UnInterest" : "Interested")}</button>
          <button type="button" className="w-30 p-3 bg-blue-400 text-white rounded-2xl shadow-lg hover:bg-blue-500 transition duration-300 cursor-pointer" disabled={loading} onClick={onBack} >Back</button>
        </div>

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

export default PetDetails;
