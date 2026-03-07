import { useEffect, useState } from "react";
import { db, auth } from "../config/firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function UserComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      // 🔥 GET USER DATA (username, warnings, blocked)
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const data = userSnap.data();
      setUserData(data);

      const q = query(
        collection(db, "complaints"),
        where("userId", "==", user.uid)
      );

      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const complaintData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComplaints(complaintData);
        setLoading(false);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500";
      case "In Progress":
        return "bg-blue-500";
      case "Resolved":
        return "bg-green-600";
      case "Rejected":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  // 🔥 BLOCKED USER SCREEN
  if (userData?.blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-gray-900 to-black text-white text-center p-6">
        <div>
          <h1 className="text-3xl font-bold text-red-500 mb-4">
            Account Suspended
          </h1>
          <p>
            Your account has been suspended due to repeated violations of
            municipal reporting guidelines. Please contact the municipality
            office for further clarification.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white bg-black">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-gray-900 to-black text-white p-8">

      {/* 🔥 USERNAME TOP LEFT */}
      <div className="text-left text-lg font-semibold mb-4 max-w-5xl mx-auto">
        Welcome, {userData?.username}
      </div>

      {/* 🔥 WARNING MESSAGES */}
      {userData?.warnings === 1 && (
        <div className="bg-yellow-500 text-black p-4 rounded-lg mb-6 max-w-5xl mx-auto">
          Official Notice: You have received a warning for inappropriate use of the reporting system.
          Please ensure all submissions follow municipal guidelines.
        </div>
      )}

      {userData?.warnings === 2 && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6 max-w-5xl mx-auto">
          Final Warning: Continued misuse of the platform will result in permanent suspension
          of your account privileges.
        </div>
      )}

      <div className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold">
          My Complaints
        </h1>

        <div className="space-x-4">
          <button
            onClick={() => navigate("/complaint")}
            className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg transition"
          >
            New Complaint
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      {complaints.length === 0 ? (
        <p className="text-center text-gray-300">
          No complaints submitted yet.
        </p>
      ) : (
        <div className="grid gap-8 max-w-5xl mx-auto">
          {complaints.map((item) => (
            <div
              key={item.id}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl"
            >
              <div className="grid md:grid-cols-2 gap-6">

                {/* LEFT SIDE */}
                <div>
                  <p className="mb-2 text-lg font-semibold">
                    Issue: {item.issueType}
                  </p>

                  <p className="mb-3 text-gray-300">
                    Description: {item.description}
                  </p>

                  <span
                    className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* RIGHT SIDE PHOTO */}
                {item.photo && (
                  <div className="flex justify-center items-center">
                    <img
                      src={item.photo}
                      alt="Complaint"
                      className="rounded-xl w-full max-w-xs object-cover shadow-lg"
                    />
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserComplaints;