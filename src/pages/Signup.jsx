import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Signup() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // OTP check
    if (otp !== "123456") {
      toast.error("Invalid OTP", { icon: "⚠️" });
      return;
    }

    // phone validation
    if (phone.length < 10) {
      toast.error("Enter valid phone number", { icon: "⚠️" });
      return;
    }

    // password validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters", { icon: "⚠️" });
      return;
    }

    const email = phone + "@urban.com";

    try {

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username: username.trim(),
        warnings: 0,
        blocked: false,
        phone: phone.trim(),
        createdAt: new Date(),
      });

      toast.success("Account created successfully!", { icon: "✔️" });

      navigate("/login");

    } catch (error) {

      console.log(error);

      if (error.code === "auth/email-already-in-use") {
        toast.error("User already exists", { icon: "⚠️" });
      }

      else {
        toast.error("Error creating account", { icon: "⚠️" });
      }

    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-gray-900 to-black text-white">

      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md shadow-2xl border border-white/20">

        <h2 className="text-3xl font-bold mb-6 text-center">
          Create Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 p-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Signup
          </button>

        </form>

        <p className="text-sm text-gray-300 text-center mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-400 cursor-pointer hover:underline"
          >
            Login here
          </span>
        </p>

      </div>

    </div>
  );
}

export default Signup;