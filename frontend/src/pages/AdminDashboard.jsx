import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Users, CheckCircle, Calendar, FileText, Upload, Filter } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllLeaves, approveLeave, rejectLeave } from '../features/leave/leaveSlice';
import { getStats, getRecentActivity } from '../features/dashboard/dashboardSlice';
import AdminLateRequests from './AdminLateRequests';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { leaves } = useSelector((state) => state.leave);
    const { stats, recentActivity } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(getAllLeaves());
        dispatch(getStats());
        dispatch(getRecentActivity());
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
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-slate-500 mt-1 text-lg">System overview and pending actions.</p>
            </div>

            {/* Stats Grid - Using updated adminStats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {adminStats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft flex flex-col justify-between h-36 transition-all duration-300 hover:shadow-glow hover:-translate-y-1 group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2 font-heading tracking-tight">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${stat.color} bg-opacity-50`}>
                                <stat.icon size={24} className={stat.textColor} strokeWidth={2.5} />
                            </div>
                        </div>
                        <span className={`text-xs font-medium ${index === 3 || index === 0 ? "text-emerald-600" : "text-slate-500"}`}>
                            {stat.sub}
                        </span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Attendance Chart */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-soft hover:shadow-lg transition-shadow duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 font-heading">Weekly Attendance Overview</h3>
                        <div className="h-72">
                            {/* Assuming Chart is theme aware or fine as is */}
                            <Bar data={attendanceTrendData} options={chartOptions} />
                        </div>
                    </div>
                    {/* Late Requests Section */}
                    <AdminLateRequests />
                </div>

                {/* Quick Actions / Recent Requests */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft flex flex-col h-[450px]">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 font-heading">Pending Actions</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {pendingLeaves.length > 0 ? (
                            pendingLeaves.map((leave) => (
                                <div key={leave.id} className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                {leave.user?.fullName ? leave.user.fullName.substring(0, 2).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{leave.user?.fullName || 'Unknown'}</p>
                                                <p className="text-xs text-slate-500">{leave.reason} • <span className="font-semibold text-slate-700">{leave.days} Days</span></p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wide">Pending</span>
                                    </div>
                                    <div className="flex space-x-3 mt-4">
                                        <button
                                            onClick={() => handleApprove(leave.id)}
                                            className="flex-1 bg-emerald-50 text-emerald-600 text-xs font-bold py-2 rounded-lg hover:bg-emerald-100 hover:shadow-sm transition-all duration-200"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(leave.id)}
                                            className="flex-1 bg-rose-50 text-rose-600 text-xs font-bold py-2 rounded-lg hover:bg-rose-100 hover:shadow-sm transition-all duration-200"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <FileText size={48} className="mb-2 opacity-20" />
                                <p className="text-sm">No pending requests</p>
                            </div>
                        )}
                    </div>
                    <Link to="/admin/leaves" className="block mt-4 w-full text-center text-sm text-primary font-bold hover:underline">View All Requests</Link>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900 font-heading">Recent Employee Activity</h3>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors"><Filter size={20} /></button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="p-5 font-semibold pl-8">Employee</th>
                                <th className="p-5 font-semibold">Activity</th>
                                <th className="p-5 font-semibold">Time</th>
                                <th className="p-5 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {recentActivity && recentActivity.length > 0 ? (
                                recentActivity.map((activity) => (
                                    <tr key={activity.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-5 pl-8 flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold group-hover:bg-white group-hover:shadow-sm transition-all">
                                                {activity.user?.fullName ? activity.user.fullName.substring(0, 2).toUpperCase() : 'U'}
                                            </div>
                                            <span className="font-medium text-gray-800">{activity.user?.fullName}</span>
                                        </td>
                                        <td className="p-5 text-gray-600">
                                            {activity.clockOutTime ? 'Checked Out' : 'Checked In'}
                                        </td>
                                        <td className="p-5 text-gray-600 font-mono text-xs">
                                            {activity.clockOutTime
                                                ? new Date(activity.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : new Date(activity.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${activity.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
                                                activity.status === 'HALF_DAY' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-rose-100 text-rose-700'
                                                }`}>
                                                {activity.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500 italic">No recent activity found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
