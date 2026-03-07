import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function AdminResolved() {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, "complaints"),
      where("status", "==", "Resolved")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComplaints(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-gray-900 to-black text-white p-8">

      <h1 className="text-4xl font-bold text-center mb-8">
        Admin - Resolved Complaints
      </h1>

      <div className="flex justify-center gap-4 mb-10">
        <button onClick={() => navigate("/admin")} className="bg-blue-600 px-5 py-2 rounded-lg">
          Waiting
        </button>
        <button onClick={() => navigate("/admin/inprogress")} className="bg-yellow-500 px-5 py-2 rounded-lg">
          In Progress
        </button>
        <button onClick={() => navigate("/admin/rejected")} className="bg-red-600 px-5 py-2 rounded-lg">
          Rejected
        </button>
      </div>

      {complaints.length === 0 ? (
        <p className="text-center text-gray-400">No resolved complaints.</p>
      ) : (
        <div className="grid gap-8 max-w-4xl mx-auto">
          {complaints.map((item) => (
            <div
              key={item.id}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-xl"
            >
              <div className="grid md:grid-cols-2 gap-6">

                <div>
                  <p><b>Issue:</b> {item.issueType}</p>
                  <p><b>Description:</b> {item.description}</p>
                  <p><b>User:</b> {item.username}</p>
                  <p><b>Phone:</b> {item.phone}</p>
                  <p><b>Date:</b> {item.date}</p>
                  <p><b>Time:</b> {item.time}</p>

                  {item.location && (
                    <p className="text-sm text-gray-300">
                      📍 {item.location.latitude?.toFixed(4)}, {item.location.longitude?.toFixed(4)}
                    </p>
                  )}
                </div>

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

              <div className="mt-4 text-green-400 font-semibold text-center">
                ✅ Status: Resolved
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminResolved;