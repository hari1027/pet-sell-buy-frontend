"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaAddressBook, FaEnvelope, FaLock, FaMobile } from "react-icons/fa";
import NotificationBar from "../NotificationBar"
import LoadingScreen from "../LoadingScreen"

export default function YourDetails() {
  const router = useRouter();
  const [userDetails, setUserDetails] = useState({
    id:"",
    email: "",
    mobileNumber: "",
    address: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
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
    const savedUser = localStorage.getItem("userDetails");
    if (savedUser) {
      setUserDetails(JSON.parse(savedUser));
    }
  }, []);

  const validate = () => {
    let errors = {};

    if (!userDetails.mobileNumber) {
        errors.mobileNumber = "Mobile number is required.";
    } else if (!/^[6789]\d{9}$/.test(userDetails.mobileNumber)) {
        errors.mobileNumber = "Invalid mobile number (must start with 6,7,8,9 and be 10 digits).";
    }

    if (!userDetails.address) {
        errors.address = "Address is required.";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangeMobileNumber = (e) => {
    setUserDetails({ ...userDetails, ["mobileNumber"]: e.target.value });
  };

  const handleChangeAddress = (e) => {
    setUserDetails({ ...userDetails, ["address"]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const endpoint = "https://pet-sell-buy.onrender.com/graphql"; // Update with your API
      const query = `
        mutation {
          updateUser(
            id: \"${userDetails.id}\",
            email: \"${userDetails.email}\",
            password: \"${userDetails.password}\",
            mobileNumber: \"${userDetails.mobileNumber}"\,
            address: \"${userDetails.address}"\
          ){id , email , mobileNumber , address , password}
        }
      `;

      const response = await axios.post(endpoint, { query }, { headers: { "Content-Type": "application/json" } });

      if (response.data.errors) {
        console.error("Failed to update details. Try again.");
        showNotification("Failed to update details. Try again.", "error");
      } else {
        showNotification("Updated Your Details Successfully", "info");
        localStorage.setItem("userDetails" , JSON.stringify(userDetails));
        router.push("/dashboard")
        setErrors({})
      }
    } catch (error) {
      console.error("Error updating details. Try again." , error);
      showNotification("Error updating details. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    setLoading(true);
    try {
      const endpoint = "https://pet-sell-buy.onrender.com/graphql";
      const query = `
        mutation {
          deleteUser(id: \"${userDetails.id}\")
        }
      `;

      const response = await axios.post(endpoint, { query }, { headers: { "Content-Type": "application/json" } });

      if (response.data.errors) {
        console.error("Failed to delete account. Try again.");
        showNotification("Failed to delete account. Please Check your orders there should be no order's left in your account .", "error");
      } else {
        showNotification("Deleted User Successfully", "info");
        localStorage.removeItem("userDetails");
        setErrors({})
        router.push("/"); 
      }
    } catch (error) {
      showNotification("Error deleting account. Try again.", "error");
      console.error("Error deleting account. Try again." , error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-fuchsia-100">
      <h2 className="text-2xl font-bold mb-6">Your Details</h2>

      <div className="relative mb-3">
        <FaEnvelope className="absolute top-4.5 left-3 text-gray-500" />
        <input type="email"  className="w-full p-3 pl-10 border-2 rounded-full text-gray-500" value={userDetails.email} disabled />
      </div>

      <div className="relative mb-4">
        <FaLock className="absolute top-4.5 left-3 text-gray-500" />
        <input type="text"  className="w-full p-3 pl-10 border-2 rounded-full text-gray-500" value={userDetails.password} disabled  />   
       </div>

      <div className="relative mb-3">
        <FaMobile className="absolute top-4.5 left-3 text-gray-500" />
        <input type="text" placeholder="Mobile Number" className="w-full p-3 pl-10 border-2 rounded-full" value={userDetails.mobileNumber} onChange={handleChangeMobileNumber}/>
        {errors.mobileNumber && <p className="text-red-500 text-sm flex justify-center">{errors.mobileNumber}</p>}
      </div>

      <div className="relative mb-3">
        <FaAddressBook className="absolute top-4.5 left-3 text-gray-500" />
        <input type="text" placeholder="Address" className="w-full p-3 pl-10 border-2 rounded-full" value={userDetails.address} onChange={handleChangeAddress} />
        {errors.address && <p className="text-red-500 text-sm flex justify-center">{errors.address}</p>}
      </div>

      <div className="flex items-center justify-between gap-4 mt-4">
         <button className="w-30 p-3 bg-green-400 text-white rounded-2xl shadow-lg hover:bg-green-400 transition duration-300 cursor-pointer" onClick={handleUpdate} disabled={loading}>{loading ? "Updating..." : "Update"}</button>
         <button className="w-30 p-3 bg-red-400 text-white rounded-2xl shadow-lg hover:bg-red-400 transition duration-300 cursor-pointer" onClick={handleDelete} disabled={loading}> {loading ? "Deleting..." : "Delete"}</button>
      </div>

      <button className="w-30 p-3 bg-blue-400 text-white rounded-2xl shadow-lg hover:bg-blue-400 transition duration-300 cursor-pointer flex items-center mt-4 justify-center" onClick={() => router.push("/dashboard")} disabled={loading}>back</button>

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
}
