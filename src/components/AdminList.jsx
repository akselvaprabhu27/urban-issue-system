import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function AdminList({ statusType }) {

  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      const querySnapshot = await getDocs(collection(db, "complaints"));
      const data = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((item) => item.status === statusType);

      setComplaints(data);
    };

    fetchComplaints();
  }, [statusType]);

  const updateStatus = async (id, newStatus) => {
    const complaintRef = doc(db, "complaints", id);

    await updateDoc(complaintRef, {
      status: newStatus,
    });

    setComplaints((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-gray-900 to-black text-white p-6">

      <h1 className="text-3xl font-bold text-center mb-8">
        {statusType} Complaints
      </h1>

      <div className="flex justify-center gap-4 mb-8">
        <button onClick={() => navigate("/admin")} className="px-4 py-2 bg-yellow-500 text-black rounded">Waiting</button>
        <button onClick={() => navigate("/admin/inprogress")} className="px-4 py-2 bg-blue-500 rounded">In Progress</button>
        <button onClick={() => navigate("/admin/resolved")} className="px-4 py-2 bg-green-500 rounded">Resolved</button>
        <button onClick={() => navigate("/admin/rejected")} className="px-4 py-2 bg-red-500 rounded">Rejected</button>
      </div>

      {complaints.length === 0 && (
        <p className="text-center text-gray-400">No complaints found.</p>
      )}

      <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {complaints.map((item) => (
          <div
            key={item.id}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl"
          >
            <h2 className="text-xl font-semibold mb-2">
              {item.issueType}
            </h2>

            <p className="text-gray-300 mb-2">
              {item.description}
            </p>

            <p className="text-sm text-gray-400">
              📍 {item.location?.latitude?.toFixed(4)},{" "}
              {item.location?.longitude?.toFixed(4)}
            </p>

            <div className="flex gap-2 mt-4">

                {statusType === "Pending" && (
                    <>
                    <button
                        onClick={() => updateStatus(item.id, "In Progress")}
                        className="px-3 py-1 bg-blue-500 rounded text-sm"
                    >
                        In Progress
                    </button>

                    <button
                        onClick={() => updateStatus(item.id, "Resolved")}
                        className="px-3 py-1 bg-green-500 rounded text-sm"
                    >
                        Resolved
                    </button>

                    <button
                        onClick={() => updateStatus(item.id, "Rejected")}
                        className="px-3 py-1 bg-red-500 rounded text-sm"
                    >
                        Reject
                    </button>
                    </>
                )}

                {statusType === "In Progress" && (
                    <button
                        onClick={() => updateStatus(item.id, "Resolved")}
                        className="px-3 py-1 bg-green-500 rounded text-sm"
                    >
                        Mark as Resolved
                    </button>
                )}

            </div>

            {item.photo && (
              <img
                src={item.photo}
                alt="Complaint"
                className="mt-4 rounded-xl w-full h-48 object-cover"
              />
            )}

          </div>
        ))}
      </div>

    </div>
  );
}

export default AdminList;
