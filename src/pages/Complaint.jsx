import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

function Complaint() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const [photo, setPhoto] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [location, setLocation] = useState(null);
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");

 useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Location error:", error);
          alert("Location permission required to submit complaint.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // back camera
      });

      videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Unable to access camera");
    }
  };

  const capturePhoto = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, 300, 200);
    const imageData = canvasRef.current.toDataURL("image/png");
    setPhoto(imageData);
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraOn(false);
  };

  const handleSubmit = async () => {
    if (!issueType || !description || !photo) {
      toast("Please complete all required fields.");
      return;
    }

    if (!location) {
      toast("Waiting for location. Please allow GPS and try again.");
      return;
    }

    try {
      setSubmitted(true);

        const user = auth.currentUser;

        if (!user) {
          toast.error("User not authenticated", { icon: "⚠️" });
          setSubmitted(false);
          return;
        }

        // 🔒 Get user document
        const userSnap = await getDoc(doc(db, "users", user.uid));

        if (!userSnap.exists()) {
          toast.error("User record not found.");
          setSubmitted(false);
          return;
        }

        const userData = userSnap.data();

        //  🚫 Block check
        if (userData?.blocked) {
          toast.error(
            "Your account has been suspended due to policy violations. Please contact the municipality for further assistance."
          );
          setSubmitted(false);
          return;
        }

        // 📝 Prepare complaint data
        const complaintData = {
          userId: user.uid,
          username: userData?.username || "Unknown User",
          phone: userData?.phone || "N/A",
          issueType,
          description,
          photo,
          location,
          status: "Pending",
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          timestamp: new Date(),
      };

      await addDoc(collection(db, "complaints"), complaintData);

      toast.success("Complaint Submitted Successfully", { icon: "✔️" });

      // Reset form
      setIssueType("");
      setDescription("");
      setPhoto(null);
      stopCamera();
      setSubmitted(false);

    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error("Error submitting complaint", { icon: "⚠️" });
      setSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-gray-900 to-black text-white flex items-center justify-center p-6">
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-lg">

        <div className="flex justify-end gap-4 mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-green-500 rounded text-sm"
          >
            Your Complaints
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 rounded text-sm"
          >
            Logout
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-center">
          Report an Issue
        </h2>

        <select
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          className="w-full p-3 mb-5 rounded-xl bg-white/20 text-white"
        >
          <option value="" className="text-black">Select Issue</option>
          <option className="text-black">Pothole</option>
          <option className="text-black">Streetlight Damage</option>
          <option className="text-black">Garbage Overflow</option>
          <option className="text-black">Water Leakage</option>
        </select>

        <textarea
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe issue..."
          className="w-full p-3 mb-5 rounded-xl bg-white/20 text-white"
        />

        <div className="text-center mb-4">
          {!cameraOn && (
            <button
              onClick={startCamera}
              className="bg-indigo-600 px-6 py-2 rounded-xl"
            >
              Start Camera
            </button>
          )}

          <video ref={videoRef} autoPlay width="300" height="200" className="mx-auto rounded-xl mt-4"></video>
          <canvas ref={canvasRef} width="300" height="200" className="hidden"></canvas>

          {cameraOn && (
            <button
              onClick={capturePhoto}
              className="mt-4 bg-green-600 px-6 py-2 rounded-xl"
            >
              Capture Photo
            </button>
          )}

          {photo && (
            <img src={photo} alt="Captured" className="rounded-xl mx-auto mt-4" />
          )}
        </div>
        
        {location && (
          <div className="mt-3 text-sm text-gray-300 text-center">
            📍 {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitted}
          className="w-full bg-indigo-600 p-3 rounded-xl"
        >
          {submitted ? "Submitting..." : "Submit Complaint"}
        </button>

      </div>
    </div>
  );
}

export default Complaint;