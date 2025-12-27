import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllLeaves, approveLeave, rejectLeave } from '../features/leave/leaveSlice';
import { CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react';

const AdminLeaveRequests = () => {
    const dispatch = useDispatch();
    const { leaves, isLoading, isError, message } = useSelector((state) => state.leave);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(getAllLeaves()).then((res) => {
            if (res.error) {
                console.error('AdminLeaveRequests: getAllLeaves failed', res.error, res.payload);
            } else {
                console.log("AdminLeaveRequests: Fetched leaves:", res.payload);
            }
        });
    }, [dispatch]);

    console.log("AdminLeaveRequests: Current leaves state:", leaves);

    const handleApprove = (id) => {
        dispatch(approveLeave(id));
    };

    const handleReject = (id) => {
        dispatch(rejectLeave(id));
    };

    const filteredLeaves = leaves.filter(leave => {
        const matchesFilter = filter === 'ALL' || leave.status === filter;

        if (!searchTerm) return matchesFilter;

        const userName = leave.user?.fullName || '';
        const leaveReason = leave.reason || '';

        const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            leaveReason.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Leave Requests</h1>
                    <p className="text-gray-500 mt-1">Manage and respond to employee leave applications.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter */}
                    <select
                        className="p-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {isError && (
                    <div className="p-4 bg-red-50 text-red-700 text-sm border-b">Error: {message || 'Failed to fetch leave requests'}</div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th className="p-4 font-semibold pl-6">Employee</th>
                                <th className="p-4 font-semibold">Type</th>
                                <th className="p-4 font-semibold">Duration</th>
                                <th className="p-4 font-semibold">Reason</th>
                                <th className="p-4 font-semibold">Applied On</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">Loading requests...</td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-red-600">{message || 'Error fetching leave requests'}</td>
                                </tr>
                            ) : filteredLeaves.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">No leave requests found.</td>
                                </tr>
                            ) : (
                                filteredLeaves.map((leave) => (
                                    <tr key={leave.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                    {leave.user?.fullName ? leave.user.fullName.substring(0, 2).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">{leave.user?.fullName || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{leave.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-700 font-medium">{leave.leaveType}</td>
                                        <td className="p-4 text-gray-600">
                                            <div className="flex flex-col">
                                                <span>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</span>
                                                <span className="text-xs text-gray-400">{leave.days} Days</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                                        <td className="p-4 text-gray-500">{new Date(leave.appliedAt || Date.now()).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1
                                                ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    leave.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                {leave.status === 'APPROVED' && <CheckCircle size={12} />}
                                                {leave.status === 'REJECTED' && <XCircle size={12} />}
                                                {leave.status === 'PENDING' && <Clock size={12} />}
                                                <span>{leave.status}</span>
                                            </span>
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            {leave.status === 'PENDING' && (
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleApprove(leave.id)}
                                                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(leave.id)}
                                                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminLeaveRequests;
