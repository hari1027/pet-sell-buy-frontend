"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaAddressBook, FaEnvelope, FaLock, FaMobile } from "react-icons/fa";
import NotificationBar from "./NotificationBar"
import  LoadingScreen from "./LoadingScreen"

export default function AuthPage() {
  const [isPage, setIsPage] = useState("main");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

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
    const savedUser = localStorage.getItem("rememberedUser");
    if (savedUser && isPage === "login") {
      const { email, password } = JSON.parse(savedUser);
      setEmail(email);
      setPassword(password);
      setRememberMe(true);
    }
  }, [isPage]);

  const validate = () => {
    let errors = {};

    if (!email) {
      errors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Invalid email format.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (isPage === "signUp") {
      if (!mobileNumber) {
        errors.mobileNumber = "Mobile number is required.";
      } else if (!/^[6789]\d{9}$/.test(mobileNumber)) {
        errors.mobileNumber = "Invalid mobile number (must start with 6,7,8,9 and be 10 digits).";
      }

      if (!address) {
        errors.address = "Address is required.";
      }
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAuth = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const endpoint = 'https://pet-sell-buy.onrender.com/graphql';
      const query = (isPage === "login")
        ? `mutation { userLogin(email: \"${email}\", password: \"${password}\"){id , email , mobileNumber , address , password} }`
        : (isPage === "signUp") ? `mutation { userSignup(email: \"${email}\", mobileNumber: \"${mobileNumber}\", address: \"${address}\", password: \"${password}\") }`
        : `mutation { forgotPassword(email: \"${email}\", password: \"${password}\") }`

      const response = await axios.post(endpoint, { query }, { headers: { "Content-Type": "application/json" } });
      if(response.data.errors){
        if(isPage === "signUp"){
           console.error("Error in signUp , already an user has been signedUp with the email or mobileNumber")
           showNotification("Error in signUp , already an user has been signedUp with the email or mobileNumber", "error");
        } else if (isPage === "login") {
           console.error("Error in login , no user exsists with this credential's please check it or if you are a new user please signUp and try again")
           showNotification("Error in login , no user exsists with this credential's please check it or if you are a new user please signUp and try again", "error");
        } else {
          console.error("Error in reset password , no user exsists with this email")
          showNotification("Error in reset password , no user exsists with this email", "error");
        }
      } else {
        if(isPage === "signUp"){
          setIsPage("main");
          setEmail("") ;
          setPassword("") ; 
          setAddress("") ;
          setMobileNumber("") ;
          setRememberMe(false) ; 
          setErrors({})
          showNotification("Signed Up Successfully", "info");
        } else if (isPage === "login") {
           showNotification("Logged In Successfully", "info");
           localStorage.setItem("userDetails",JSON.stringify(response.data?.data?.userLogin))
           router.push("/dashboard");
        } else {
           setEmail("") ;
           setPassword("") ;
           setRememberMe(false);
           setIsPage("main");
           showNotification("Password Changed Successfully", "info");
        }
      }
      if (rememberMe && isPage === "login") {
          localStorage.setItem("rememberedUser", JSON.stringify({ email, password }));
      } else { 
        if(localStorage.getItem("rememberedUser")){
            localStorage.removeItem("rememberedUser")
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error occurred, please try again:" , error);
      showNotification("Error occurred, please try again", "error");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-fuchsia-100 flex-col">
      <h2 className="text-2xl font-bold text-center mt-4 mb-4">
        {isPage === "main" ? "Welcome To Pet World" : (isPage === "login") ? "Login" : (isPage === "signUp")?  "Sign Up" : "Change Password"}
      </h2>

      {isPage === "main" ? (
        <>
          <button className="w-30 p-3 mb-2 bg-blue-500 text-white rounded-2xl cursor-pointer" onClick={() => setIsPage("login")}>Login</button>
          <button className="w-30 p-3 bg-green-500 text-white rounded-2xl cursor-pointer" onClick={() => setIsPage("signUp")}>Signup</button>
        </>
      ) : (
        <>
          <div className="relative mb-3">
            <FaEnvelope className="absolute top-4 left-3 text-gray-500" />
            <input type="email" placeholder="Email" className="w-full p-3 pl-10 border-2 rounded-full" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p className="text-red-500 text-sm flex justify-center">{errors.email}</p>}
          </div>

          {isPage === "signUp" && (
            <>
              <div className="relative mb-3">
                <FaMobile className="absolute top-4 left-3 text-gray-500" />
                <input type="text" placeholder="Mobile Number" className="w-full p-3 pl-10 border-2 rounded-full" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
                {errors.mobileNumber && <p className="text-red-500 text-sm flex justify-center">{errors.mobileNumber}</p>}
              </div>

              <div className="relative mb-3">
                <FaAddressBook className="absolute top-4 left-3 text-gray-500" />
                <input type="text" placeholder="Address" className="w-full p-3 pl-10 border-2 rounded-full" value={address} onChange={(e) => setAddress(e.target.value)} />
                {errors.address && <p className="text-red-500 text-sm flex justify-center">{errors.address}</p>}
              </div>
            </>
          )}

          <div className="relative mb-4">
            <FaLock className="absolute top-4 left-3 text-gray-500" />
            <input type="password" placeholder={isPage === "forgot password" ? "New Password":"Password"} className="w-full p-3 pl-10 border-2 rounded-full" value={password} onChange={(e) => setPassword(e.target.value)} />
            {errors.password && <p className="text-red-500 text-sm flex justify-center">{errors.password}</p>}
          </div>

          {isPage === "login" && (
              <div className="flex items-center justify-between mb-4 text-xs gap-10">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 cursor-pointer" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                  Remember Me
                </label>
                <span className="text-blue-500 cursor-pointer" onClick={() => {setIsPage("forgot password") ; setEmail("") ; setPassword("") ; }}>Forgot Password?</span>
              </div>
          )}
            <div className="flex items-center justify-between gap-4">
            <button className="w-30 p-3 bg-green-400 text-white rounded-2xl shadow-lg hover:bg-green-400 transition duration-300 cursor-pointer" onClick={handleAuth} disabled={loading}>{loading ? 'Processing...' : 'Confirm'}</button>
            <button className="w-30 p-3 bg-red-400 text-white rounded-2xl shadow-lg hover:bg-red-400 transition duration-300 cursor-pointer" onClick={() => {setIsPage("main"); setEmail("") ; setPassword("") ; setAddress("") ; setMobileNumber("") ; setRememberMe(false) ;  setErrors({})}}>Back</button>
            </div>      
        </>
      )}
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
