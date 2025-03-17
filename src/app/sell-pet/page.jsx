"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";
import NotificationBar from "../NotificationBar"
import LoadingScreen from "../LoadingScreen"

export default function AddPet() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploadedRecordUrls, setUploadedRecordUrls] = useState([]);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });

  const showNotification = (msg, type) => {
    setNotification({ message: msg, type, show: true });
    setTimeout(() => setNotification({ ...notification, show: false }), 5000);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
  
    const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (typeof value === "number" && isNaN(value)) {
        acc[key] = null;
      } else if (value === "") {
        acc[key] = null;
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
  
    Object.entries(sanitizedData).forEach(([key, value]) => {
      if (value !== null) {
        formData.append(key, value);
      }
    });
  
    setLoading(true);
    try {
        const endpoint = "https://pet-sell-buy.onrender.com/graphql"; 
        const userDetails = JSON.parse(localStorage.getItem("userDetails"));
        const imagesArray = uploadedUrls.map(img => `{ url: "${img.url}", name: "${img.name}" }`).join(",");
        const medicalRecordsArray = uploadedRecordUrls.map(rec => `{ url: "${rec.url}", name: "${rec.name}" }`).join(",");

        const query = `
          mutation {
            addYourPetToSale(
              type: "${sanitizedData.type}",
              numbers: ${sanitizedData.numbers ? Number(sanitizedData.numbers) : 1},
              ownerId: "${userDetails.id}",
              breed: ${sanitizedData.breed ? `"${sanitizedData.breed}"` : null},
              gender: ${sanitizedData.gender ? `"${sanitizedData.gender}"` : null},
              age: ${sanitizedData.age ? Number(sanitizedData.age) : null},
              price: ${sanitizedData.price ? Number(sanitizedData.price) : null},
              images: [${imagesArray}],
              medicalRecords: [${medicalRecordsArray}] 
            ) {
              id
            }
          }
        `;

        const response = await axios.post(endpoint, { query }, { headers: { "Content-Type": "application/json" } });

        if (response.data.errors) {
            console.error("Failed to add to sale. Try again.");
            showNotification("Failed to add to sale. Try again.", "error");
        } else {
            showNotification("Added your Pet to the Sale", "info");
            router.push("/dashboard");
        }
    } catch (error) {
        console.error("Error in adding pet" , error);
        showNotification("Error in adding pet", "error");
    } finally {
        setLoading(false);
    }
};


  const handleFileChange = (event , isRecordUrl) => {
    const files = Array.from(event.target.files);
    handleUpload(files , isRecordUrl)
  };

  const removeFile = (index , isRecordUrl) => {
    if(!isRecordUrl){
      let newuploadedUrls = uploadedUrls.filter((_, i) => i !== index); 
      setUploadedUrls(newuploadedUrls);
    }
    else{ 
      let newUploadedRecordUrls = uploadedRecordUrls.filter((_, i) => i !== index);
      setUploadedRecordUrls(newUploadedRecordUrls);
    }
 };

  const handleUpload = async (selectedImages , isRecordUrl) => {
    if (!selectedImages.length) {
      console.error("Error in uploading file");
      showNotification("Error in uploading file", "error");
      return;
    }
  
    const formData = new FormData();
    selectedImages.forEach((file) => formData.append("file", file)); 
  
    try {
      const response = await fetch("https://pet-sell-buy.onrender.com/upload", { 
        method: "POST",
        body: formData,
        headers: {
          'x-apollo-operation-name': 'FileUpload',
        },
      });
  
      const data = await response.json();
      if(!isRecordUrl){
        setUploadedUrls((prev) => [...prev, data.file]);
      } else {
        setUploadedRecordUrls((prev) => [...prev, data.file])
      }
    } catch (error) {
      console.error("Upload error:", error);
      showNotification("Upload error", "error");
    }
  };


  return (
    <div className="flex items-center justify-center h-full p-8 bg-fuchsia-100 flex-col">
      <h2 className="text-2xl font-bold mb-6 text-center">Add a Pet</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
        
        {/* Pet Type */}
        <div>
          <label className="block font-bold text-center mb-2">Type *</label>
          <select
            {...register("type", { required: "Pet type is required" })}
            className={`w-full p-3 pl-3 pr-5 border-2 border-black rounded-full appearance-none cursor-pointer 
              ${watch("type") ? "text-black" : "text-gray-400"}`}
          >
            <option value="" className="text-gray-400">Select Pet Type</option>
            {["dog", "cat", "bird", "fish", "cow", "hen", "cock", "horse", "rabbit", "pig", "hamster", "turtle"].map((pet) => (
              <option key={pet} value={pet} className="text-black">{pet}</option>
            ))}
          </select>
          {errors.type && <p className="text-red-500 text-sm mt-1 text-center">{errors.type.message}</p>}
        </div>

        {/* Numbers */}
        <div>
          <label className="block font-bold text-center mb-2">Numbers</label>
          <input 
            type="number" 
            {...register("numbers", {valueAsNumber: true })} 
            className="w-full p-3 pl-3 border-2 rounded-full text-black bg-fuchsia-100 placeholder-gray-400"
            placeholder="Enter quantity" 
            min="1"
          />
        </div>

        {/* Breed */}
        <div>
          <label className="block font-bold text-center mb-2">Breed</label>
          <input type="text" {...register("breed")} className="w-full p-3 pl-3 border-2 rounded-full text-black placeholder-gray-400" placeholder="Enter breed" />
        </div>

        {/* Gender */}
        <div>
          <label className="block font-bold text-center mb-2">Gender</label>
          <select
            {...register("gender")}
            className={`w-full p-3 pl-3 pr-5 border-2 border-black rounded-full appearance-none cursor-pointer
            ${watch("gender") ? "text-black" : "text-gray-400"}`}
          >
            <option value="" className="text-gray-400">Select Gender</option>
            <option value="male" className="text-black">Male</option>
            <option value="female" className="text-black">Female</option>
            {watch("numbers") > 1 && <option value="both" className="text-black">Both</option>}
          </select>
        </div>

        {/* Age */}
        <div>
          <label className="block font-bold text-center mb-2">Age</label>
          <input type="number" {...register("age", { min: 1, valueAsNumber: true })} className="w-full p-3 pl-3 border-2 rounded-full text-black placeholder-gray-400" placeholder="Enter age" min="1" />
        </div>

        {/* Price */}
        <div>
          <label className="block font-bold text-center mb-2">Price</label>
          <input type="number" {...register("price", { min: 1, valueAsNumber: true })} className="w-full p-3 pl-3 border-2 rounded-full text-black placeholder-gray-400" placeholder="Enter price" min="1" />
        </div>

        {/* Images Upload */}
        <div>
          <label className="block font-bold text-center mb-2">Images</label>
          <label className="w-full flex justify-center items-center cursor-pointer border-2 rounded-full text-gray-400 bg-fuchsia-100 p-3 pl-5 border-black">
            Click to Upload Images
            <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e , false)} className="hidden" />
          </label>
          <div className="mt-2 flex flex-wrap gap-2 items-center justify-center">
            {uploadedUrls.map((image, index) => (
              <span key={index} className="bg-gray-200 p-2 pl-4 pr-4 rounded-full flex items-center">
                {image.name}
                <button type="button" onClick={() => removeFile(index , false)} className="text-red-500 ml-2 cursor-pointer">✖</button>
              </span>
            ))}
          </div>
        </div>

        {/* Medical Records Upload */}
        <div>
          <label className="block font-bold text-center mb-2">Medical Records</label>
          <label className="w-full flex justify-center items-center cursor-pointer border-2 rounded-full text-gray-400 bg-fuchsia-100 p-3 pl-5 border-black">
            Click to Upload Images
            <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e ,true)} className="hidden" />
          </label>
          <div className="mt-2 flex flex-wrap gap-2 items-center justify-center">
            {uploadedRecordUrls.map((image, index) => (
              <span key={index} className="bg-gray-200 p-2 pl-4 pr-4 rounded-full flex items-center">
                {image.name}
                <button type="button" onClick={() => removeFile(index , true)} className="text-red-500 ml-2 cursor-pointer">✖</button>
              </span>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button type="submit" className="w-30 p-3 bg-green-400 text-white rounded-2xl shadow-lg hover:bg-green-500 transition duration-300 cursor-pointer">{loading ? "Adding" : "Add"}</button>
          <button type="button" className="w-30 p-3 bg-blue-400 text-white rounded-2xl shadow-lg hover:bg-blue-500 transition duration-300 cursor-pointer" onClick={() => router.push("/dashboard")}>Back</button>
        </div>

      </form>
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
