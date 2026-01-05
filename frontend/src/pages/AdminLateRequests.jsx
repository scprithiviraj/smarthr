import React, { useEffect, useState } from 'react';
import api from '../utils/axios';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminLateRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/attendance/late-requests/pending');
            console.log("AdminLateRequests fetched:", response.data);
            setRequests(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch requests", error);
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Approve this late request?")) return;
        try {
            await api.put(`/attendance/late-request/${id}/approve`);
            alert("Request Approved");
            fetchRequests(); // Refresh
        } catch (error) {
            console.error(error);
            alert("Action failed");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Reject this late request?")) return;
        try {
            await api.put(`/attendance/late-request/${id}/reject`);
            alert("Request Rejected");
            fetchRequests(); // Refresh
        } catch (error) {
            console.error(error);
            alert("Action failed");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading requests...</div>;

    return (
        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                <Clock className="text-orange-500" />
                <h3 className="text-lg font-bold text-gray-900 font-heading">Late Punch-in Requests</h3>
            </div>

            {requests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No pending late requests.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4 font-semibold">Employee</th>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Reason</th>
                                <th className="p-4 font-semibold">Request Time</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">
                                        {req.user?.fullName || req.user?.username || `User #${req.user?.id}`}
                                    </td>
                                    <td className="p-4 text-slate-600">
                                        {new Date(req.date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-slate-800 italic">
                                        "{req.reason}"
                                    </td>
                                    <td className="p-4 text-slate-500 font-mono text-xs">
                                        {new Date(req.requestTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <button
                                            onClick={() => handleApprove(req.id)}
                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                            title="Approve"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleReject(req.id)}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Reject"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminLateRequests;
