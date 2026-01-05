import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyLeaves, reset } from '../features/leave/leaveSlice';
import { FileText, CheckCircle, Clock, XCircle, Search, Eye, Filter } from 'lucide-react';

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
        { label: 'Total Requests', value: total, sub: 'This year', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Approved', value: approved, sub: 'Requests approved', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pending', value: pending, sub: 'Awaiting approval', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Rejected', value: rejected, sub: 'Requests rejected', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Approved</span>;
            case 'PENDING':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">Pending</span>;
            case 'REJECTED':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">Rejected</span>;
            case 'CANCELLED':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">Cancelled</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Leave History</h1>
                <p className="text-slate-500 mt-1 text-lg">View and track all your leave requests.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft hover:shadow-lg transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <span className={`text-3xl font-bold font-heading text-gray-900`}>{stat.value}</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">{stat.label}</p>
                            <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 font-heading">All Leave Requests</h3>
                        <p className="text-sm text-slate-500 mt-1">Complete history of your leave applications</p>
                    </div>
                    <div className="flex space-x-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" />
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            <Filter size={18} />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-gray-100">
                            <tr>
                                <th className="p-6 pl-8">Leave Type</th>
                                <th className="p-6">Duration</th>
                                <th className="p-6">Days</th>
                                <th className="p-6">Applied On</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {leaves.map((leave) => (
                                <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-6 pl-8 font-bold text-gray-900">{leave.leaveType}</td>
                                    <td className="p-6 text-slate-600 font-medium">{leave.startDate} - {leave.endDate}</td>
                                    <td className="p-6 text-slate-600 font-medium">
                                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-xs font-bold border border-slate-200">
                                            {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                                        </span>
                                    </td>
                                    <td className="p-6 text-slate-500">
                                        {leave.appliedAt ? new Date(leave.appliedAt).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="p-6">
                                        {getStatusBadge(leave.status)}
                                    </td>
                                    <td className="p-6 text-right pr-8">
                                        <button className="text-slate-400 hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-lg">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {leaves.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <FileText size={48} className="mb-4 opacity-20" />
                                            <p className="text-lg font-medium text-slate-500">No leave requests found</p>
                                            <p className="text-sm">Requests you make will appear here</p>
                                        </div>
                                    </td>
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
