"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import NotificationBar from "../NotificationBar"
import LoadingScreen from "../LoadingScreen"

export default function Dashboard() {
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

  const handleLogout = () => {
    setLoading(true)
    localStorage.removeItem("userDetails")
    showNotification("Logged Out Successfully", "info");
    router.push("/"); 
  };

  return (
    <div className="flex items-center justify-center h-screen bg-fuchsia-100 flex-col">
      <h2 className="text-2xl font-bold mb-6 flex justify-center items-center text-center">Welcome to Your Dashboard</h2>
      <button className="w-40 p-3 mb-2 bg-blue-500 text-white rounded-xl cursor-pointer" onClick={() => {setLoading(true) ; router.push("/your-details")}}>Your Details</button>
      <button className="w-40 p-3 mb-2 bg-yellow-500 text-white rounded-xl cursor-pointer" onClick={() => {setLoading(true) ; router.push("/your-orders")}}>Your Orders</button>
      <button className="w-40 p-3 mb-2 bg-green-500 text-white rounded-xl cursor-pointer" onClick={() => {setLoading(true) ; router.push("/buy-pet")}}>Buy Pet</button>
      <button className="w-40 p-3 mb-2 bg-orange-500 text-white rounded-xl cursor-pointer" onClick={() => {setLoading(true) ; router.push("/sell-pet")}}>Sell Pet</button>
      <button className="w-40 p-3 bg-red-500 text-white rounded-xl cursor-pointer" onClick={handleLogout}>Logout</button>
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
