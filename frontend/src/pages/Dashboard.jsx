import { useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Users, CheckCircle, Clock, Calendar, FileText } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { getStats, reset } from '../features/dashboard/dashboardSlice';
import AdminDashboard from './AdminDashboard';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { stats, isLoading } = useSelector((state) => state.dashboard);

    console.log("Current User in Dashboard:", user);

    useEffect(() => {
        if (user && !user?.roles?.includes('ADMIN')) {
            dispatch(getStats());
        }
        return () => {
            dispatch(reset());
        };
    }, [user, dispatch]);

    if (user?.roles?.includes('ADMIN')) {
        return <AdminDashboard />;
    }

    if (isLoading) {
        return <div className="text-center p-10">Loading Dashboard...</div>;
    }

    // Use mock data if API stats are not available
    const dashboardStats = stats || {
        totalPresent: 22,
        totalAbsent: 2,
        totalLeaves: 3,
        pendingLeaves: 1,
        workingHours: "8h 30m",
        avgWorkingHours: "8h 15m"
    };

    // --- Data Preparation ---

    // 1. Stats Cards Data
    const statCardsData = [
        {
            label: "Today's Status",
            value: "Present",
            subtext: "Checked in at 9:15 AM",
            iconName: "Clock",
            color: "bg-green-100",
            textColor: "text-green-600"
        },
        {
            label: `Working Hours (${new Date().toLocaleString('default', { month: 'short' })})`,
            value: `${dashboardStats?.totalWorkingHours ? dashboardStats.totalWorkingHours.toFixed(1) : 0} hrs`,
            subtext: "Total for this month",
            iconName: "Users",
            color: "bg-blue-100",
            textColor: "text-blue-600"
        },
        {
            label: "Leaves (This Year)",
            value: `${dashboardStats?.attendanceStatusCounts?.LEAVE || dashboardStats?.totalLeaves || 0} / 24`,
            subtext: "14 days remaining",
            iconName: "Calendar",
            color: "bg-orange-100",
            textColor: "text-orange-600"
        },
        {
            label: "Pending Requests",
            value: dashboardStats?.pendingLeaves || 0,
            subtext: "1 leave, 1 regularization",
            iconName: "FileText",
            color: "bg-purple-100",
            textColor: "text-purple-600"
        },
    ];

    // Icon mapping
    const iconMap = {
        Clock: Clock,
        Users: Users,
        Calendar: Calendar,
        FileText: FileText
    };

    // 2. Charts
    // Monthly Attendance (Bar Chart)
    const monthlyLabels = Object.keys(dashboardStats?.lastSixMonthsAttendance || {}).length > 0
        ? Object.keys(dashboardStats.lastSixMonthsAttendance)
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    const monthlyData = Object.keys(dashboardStats?.lastSixMonthsAttendance || {}).length > 0
        ? Object.values(dashboardStats.lastSixMonthsAttendance)
        : [22, 20, 24, 21, 23, 19]; // Fallback mock

    const barChartData = {
        labels: monthlyLabels,
        datasets: [{
            label: 'Present Days',
            data: monthlyData,
            backgroundColor: 'black',
            borderRadius: 5,
            barThickness: 40,
        }]
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 30,
                grid: { borderDash: [2, 2] }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    // Leave Distribution (Pie Chart)
    const pieChartData = {
        labels: ['Sick Leave', 'Casual Leave', 'Earned Leave'],
        datasets: [{
            data: [3, 5, 2], // Mock distribution as backend only gives total LEAVE count usually
            backgroundColor: ['#EF4444', '#3B82F6', '#10B981'], // Red, Blue, Green
            borderWidth: 0,
        }]
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8 } }
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back! Here's your attendance overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCardsData.map((card, index) => {
                    const IconComponent = iconMap[card.iconName];
                    return (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-36">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{card.label}</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-2">{card.value}</h3>
                                </div>
                                <div className={`p-2 rounded-lg ${card.color}`}>
                                    <IconComponent className={card.textColor} size={24} />
                                </div>
                            </div>
                            <div className="flex items-center text-xs">
                                {index === 0 && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-2">Present</span>}
                                <span className={index === 1 ? "text-green-600" : "text-gray-500"}>
                                    {card.subtext}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Attendance */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Monthly Attendance</h3>
                    <p className="text-sm text-gray-500 mb-6">Your attendance trend over the last 6 months</p>
                    <div className="h-64">
                        <Bar data={barChartData} options={barChartOptions} />
                    </div>
                </div>

                {/* Leave Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Leave Distribution</h3>
                    <p className="text-sm text-gray-500 mb-6">Breakdown of leaves taken this year</p>
                    <div className="h-64 flex justify-center">
                        <Doughnut data={pieChartData} options={pieChartOptions} />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                <p className="text-sm text-gray-500 mb-6">Your latest attendance and leave activities</p>

                <div className="space-y-6">
                    {dashboardStats?.activityFeed?.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-4">
                            <div className={`mt-1 p-2 rounded-full ${activity.type === 'ATTENDANCE' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                {activity.type === 'ATTENDANCE' ? <CheckCircle size={16} /> : <Clock size={16} />}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{new Date(activity.date).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                    {(!dashboardStats?.activityFeed || dashboardStats.activityFeed.length === 0) && (
                        <p className="text-gray-500 text-sm">No recent activity.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Dashboard;
