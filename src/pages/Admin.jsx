import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

function Admin() {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, "complaints"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const pendingOnly = data.filter(
          (item) => item.status === "Pending"
        );

        setComplaints(pendingOnly);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateStatus = async (complaint, newStatus) => {
    try {

      const snapshot = await getDocs(collection(db, "complaints"));

      const updates = [];

      snapshot.forEach((docItem) => {
        const data = docItem.data();

        if (data.location && complaint.location) {

          const dLat = Math.abs(data.location.latitude - complaint.location.latitude);
          const dLng = Math.abs(data.location.longitude - complaint.location.longitude);

          const sameIssue = data.issueType === complaint.issueType;

          if (dLat < 0.0001 && dLng < 0.0001 && sameIssue) {
            updates.push(
              updateDoc(doc(db, "complaints", docItem.id), {
                status: newStatus
             })
            );
          }
        }
      });

      await Promise.all(updates);

    } catch (error) {
      console.error("Error updating grouped complaints:", error);
    }
  };
  
  const handleUserDiscipline = async (userId) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (!userData) return;

    const warnings = userData.warnings || 0;

    if (warnings === 0) {
      await updateDoc(userRef, { warnings: 1 });
      toast("First warning issued.");
    } else if (warnings === 1) {
      await updateDoc(userRef, { warnings: 2 });
      toast("Second warning issued.");
    } else if (warnings >= 2) {
      await updateDoc(userRef, { blocked: true });
      toast.error("User has been blocked.");
    }
  };
  const countNearbyComplaints = (lat, lng, issueType, allComplaints) => {
    let count = 0;

    allComplaints.forEach((item) => {
      if (item.location && item.issueType === issueType) {
        const dLat = Math.abs(item.location.latitude - lat);
        const dLng = Math.abs(item.location.longitude - lng);

        if (dLat < 0.0001 && dLng < 0.0001) {
          count++;
       }
      }
    });

    return count;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-gray-900 to-black text-white p-8">

      <h1 className="text-4xl font-bold text-center mb-8">
        Admin - Waiting Complaints
      </h1>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={() => navigate("/admin/inprogress")}
          className="bg-yellow-500 hover:bg-yellow-600 px-5 py-2 rounded-lg transition"
        >
          In Progress
        </button>

        <button
          onClick={() => navigate("/admin/resolved")}
          className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg transition"
        >
          Resolved
        </button>

        <button
          onClick={() => navigate("/admin/rejected")}
          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg transition"
        >
          Rejected
        </button>
      </div>

      {complaints.length === 0 ? (
        <p className="text-center text-gray-400">
          No pending complaints.
        </p>
      ) : (
        <div className="grid gap-8 max-w-4xl mx-auto">
          {complaints.map((item) => (
            <div
              key={item.id}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl"
            >
              <div className="grid md:grid-cols-2 gap-6">

                {/* Left Side - Details */}
                <div>
                  <p className="mb-2">
                    <span className="font-semibold">Issue:</span> {item.issueType}
                  </p>

                  <p className="text-sm text-yellow-400">
                    Reports from nearby users: {countNearbyComplaints(
                      item.location?.latitude,
                      item.location?.longitude,
                      item.issueType,
                      complaints
                    )}
                  </p>


                  <p className="mb-2">
                    <span className="font-semibold">Description:</span> {item.description}
                  </p>

                  <p className="mb-2">
                    <span className="font-semibold">User:</span> {item.username}
                  </p>

                  <p className="mb-2">  
                    <span className="font-semibold">Phone:</span> {item.phone}
                  </p>

                  <p className="mb-2">
                    <span className="font-semibold">Date:</span> {item.date}
                  </p>

                  <p className="mb-2">
                    <span className="font-semibold">Time:</span> {item.time}
                  </p>

                  {item.location && (
                    <p className="text-sm text-gray-400">
                      📍 {item.location.latitude?.toFixed(5)},{" "}
                      {item.location.longitude?.toFixed(5)}
                    </p>
                  )}
                </div>

                {/* Right Side - Photo */}
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

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6 justify-center">
                <button
                  onClick={() => updateStatus(item, "In Progress")}
                  className="bg-yellow-500 hover:bg-yellow-600 px-5 py-2 rounded-lg transition"
                >
                  In Progress
                </button>

                <button
                  onClick={() => updateStatus(item, "Resolved")}
                  className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg transition"
                >
                  Resolved
                </button>

                <button
                  onClick={() => updateStatus(item.id, "Rejected")}
                  className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleUserDiscipline(item.userId)}
                  className="bg-yellow-600 hover:bg-yellow-700 px-5 py-2 rounded-lg transition"
                >
                  Discipline User
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Admin;