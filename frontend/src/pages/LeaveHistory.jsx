import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyLeaves, reset } from '../features/leave/leaveSlice';
import { FileText, CheckCircle, Clock, XCircle, Search, Eye } from 'lucide-react';

const LeaveHistory = () => {
    const dispatch = useDispatch();
    const { leaves, isLoading } = useSelector((state) => state.leave);

    useEffect(() => {
        dispatch(getMyLeaves());
        return () => {
            dispatch(reset());
        }
    }, [dispatch]);

    // Stats
    const total = leaves.length;
    const approved = leaves.filter(l => l.status === 'APPROVED').length;
    const pending = leaves.filter(l => l.status === 'PENDING').length;
    const rejected = leaves.filter(l => l.status === 'REJECTED').length;

    const stats = [
        { label: 'Total Requests', value: total, sub: 'This year', icon: FileText, color: 'text-blue-600', countColor: 'text-gray-800' },
        { label: 'Approved', value: approved, sub: 'Requests approved', icon: CheckCircle, color: 'text-green-500', countColor: 'text-gray-800' },
        { label: 'Pending', value: pending, sub: 'Awaiting approval', icon: Clock, color: 'text-yellow-500', countColor: 'text-gray-800' },
        { label: 'Rejected', value: rejected, sub: 'Requests rejected', icon: XCircle, color: 'text-red-500', countColor: 'text-gray-800' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Leave History</h1>
                <p className="text-gray-500 mt-1">View and track all your leave requests.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <h3 className={`text-3xl font-bold mt-2 ${stat.countColor}`}>{stat.value}</h3>
                            </div>
                            <div className={`p-1 ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">All Leave Requests</h3>
                        <p className="text-sm text-gray-500">Complete history of your leave applications</p>
                    </div>
                    <div className="flex space-x-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        {/* Dropdowns Mockups */}
                        <select className="border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
                            <option>All Types</option>
                        </select>
                        <select className="border rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
                            <option>All Status</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th className="p-4 font-semibold pl-6">Leave Type</th>
                                <th className="p-4 font-semibold">Duration</th>
                                <th className="p-4 font-semibold">Days</th>
                                <th className="p-4 font-semibold">Applied On</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {leaves.map((leave) => (
                                <tr key={leave.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 pl-6 font-medium text-gray-800">{leave.leaveType}</td>
                                    <td className="p-4 text-gray-600">{leave.startDate} - {leave.endDate}</td>
                                    <td className="p-4 text-gray-600">
                                        {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                                    </td>
                                    <td className="p-4 text-gray-600">Dec 10, 2024</td> {/* Mock Applied Date if missing */}
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-md text-xs font-semibold text-white ${leave.status === 'APPROVED' ? 'bg-green-500' :
                                                leave.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <button className="text-gray-400 hover:text-blue-600 flex items-center justify-end space-x-1 ml-auto">
                                            <Eye size={16} />
                                            <span>View</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {leaves.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">No records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaveHistory;
