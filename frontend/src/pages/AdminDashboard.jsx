import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Users, CheckCircle, Calendar, FileText, Upload, Filter } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllLeaves, approveLeave, rejectLeave } from '../features/leave/leaveSlice';
import { getStats } from '../features/dashboard/dashboardSlice';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { leaves } = useSelector((state) => state.leave);
    const { stats } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(getAllLeaves());
        dispatch(getStats());
    }, [dispatch]);

    const handleApprove = (id) => {
        dispatch(approveLeave(id));
    };

    const handleReject = (id) => {
        dispatch(rejectLeave(id));
    };

    // Filter Pending Leaves
    const pendingLeaves = leaves ? leaves.filter(l => l.status === 'PENDING') : [];

    // Real Admin Data
    const adminStats = [
        { label: 'Total Employees', value: stats?.totalEmployees || 0, sub: 'Registered Users', icon: Users, color: 'bg-blue-100', textColor: 'text-blue-600' },
        { label: 'Present Today', value: stats?.presentDays || 0, sub: 'Checked In', icon: CheckCircle, color: 'bg-green-100', textColor: 'text-green-600' },
        { label: 'Pending Requests', value: stats?.pendingLeaves || 0, sub: 'Requires attention', icon: FileText, color: 'bg-purple-100', textColor: 'text-purple-600' },
        { label: 'On Leave', value: stats?.statusCounts?.LEAVE || 0, sub: 'Approved Leaves', icon: Calendar, color: 'bg-orange-100', textColor: 'text-orange-600' },
    ];

    // ... (Chart Data remains same or dynamic later)
    const attendanceTrendData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
            label: 'Attendance',
            data: [40, 38, 42, 35, 41, 15], // Mock data
            backgroundColor: '#3B82F6',
            borderRadius: 5,
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 50,
            }
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* ... Headers ... */}

            {/* Stats Grid - Using updated adminStats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {adminStats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-36 transition hover:shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</h3>
                            </div>
                            <div className={`p-2 rounded-lg ${stat.color} ${stat.textColor}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <span className={`text-xs ${index === 3 || index === 0 ? "text-green-600" : "text-gray-500"}`}>
                            {stat.sub}
                        </span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attendance Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Weekly Attendance Overview</h3>
                    <div className="h-72">
                        {/* Assuming Chart is theme aware or fine as is */}
                        <Bar data={attendanceTrendData} options={chartOptions} />
                    </div>
                </div>

                {/* Quick Actions / Recent Requests */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Pending Actions</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                        {pendingLeaves.length > 0 ? (
                            pendingLeaves.map((leave) => (
                                <div key={leave.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                {leave.user?.fullName ? leave.user.fullName.substring(0, 2).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{leave.user?.fullName || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500">{leave.reason} • {leave.days} Days</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">Pending</span>
                                    </div>
                                    <div className="flex space-x-2 mt-3">
                                        <button
                                            onClick={() => handleApprove(leave.id)}
                                            className="flex-1 bg-green-50 text-green-600 text-xs font-bold py-1.5 rounded hover:bg-green-100 transition"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(leave.id)}
                                            className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-1.5 rounded hover:bg-red-100 transition"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No pending requests</p>
                        )}
                    </div>
                    <Link to="/admin/leaves" className="block mt-4 w-full text-center text-sm text-blue-600 font-semibold hover:underline">View All Requests</Link>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Recent Employee Activity</h3>
                    <button className="text-gray-400 hover:text-gray-600"><Filter size={20} /></button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th className="p-4 font-semibold pl-6">Employee</th>
                                <th className="p-4 font-semibold">Activity</th>
                                <th className="p-4 font-semibold">Time</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="hover:bg-gray-50 transition">
                                    <td className="p-4 pl-6 flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">AS</div>
                                        <span className="font-medium text-gray-800">Alice Smith</span>
                                    </td>
                                    <td className="p-4 text-gray-600">Checked In</td>
                                    <td className="p-4 text-gray-600">09:00 AM</td>
                                    <td className="p-4">
                                        <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-bold">On Time</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
