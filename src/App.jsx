import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserComplaints from "./pages/UserComplaints";
import Complaint from "./pages/Complaint";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminInProgress from "./pages/AdminInProgress";
import AdminResolved from "./pages/AdminResolved";
import AdminRejected from "./pages/AdminRejected";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#111827",
            color: "#fff",
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "14px",
          },
      }}
    />
      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* USER LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* SIGNUP */}
        <Route path="/signup" element={<Signup />} />

        {/* USER DASHBOARD */}
        <Route
          path="/dashboard"
          element={user ? <UserComplaints /> : <Navigate to="/login" />}
        />

        {/* SUBMIT COMPLAINT */}
        <Route
          path="/complaint"
          element={user ? <Complaint /> : <Navigate to="/login" />}
        />

        {/* ADMIN LOGIN */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* ADMIN PAGES */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/inprogress" element={<AdminInProgress />} />
        <Route path="/admin/resolved" element={<AdminResolved />} />
        <Route path="/admin/rejected" element={<AdminRejected />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;