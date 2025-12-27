import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Clock, Users, LogOut, FileText, Settings as SettingsIcon, CheckCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    let navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];

    if (user?.roles?.includes('ADMIN')) {
        navItems = [
            ...navItems,
            { path: '/employees', label: 'Employees', icon: Users },
            { path: '/admin/leaves', label: 'Leave Requests', icon: CheckCircle },
            { path: '/reports', label: 'Reports', icon: FileText },
            { path: '/calendar', label: 'Calendar', icon: Calendar },
        ];
    } else {
        navItems = [
            ...navItems,
            { path: '/attendance', label: 'Attendance', icon: Clock },
            { path: '/leave', label: 'Apply Leave', icon: Calendar },
            { path: '/leave-history', label: 'Leave History', icon: FileText },
            { path: '/calendar', label: 'Calendar', icon: Calendar },
            { path: '/reports', label: 'Reports', icon: FileText },
        ];
    }

    return (
        <div className="bg-white w-64 h-screen fixed px-4 py-6 border-r flex flex-col justify-between transition-colors duration-200">
            <div>
                {/* Logo Section */}
                <div className="flex items-center space-x-3 px-4 mb-10">
                    <div className="p-2 bg-primary rounded-lg">
                        <Clock className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 leading-tight">AttendEase</h1>
                        <p className="text-xs text-gray-500">HR System</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${active
                                    ? 'bg-primary text-white font-medium shadow-md'
                                    : 'text-gray-600 hover:bg-blue-50 hover:text-primary'
                                    }`}
                            >
                                <item.icon size={20} className={`transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`} />
                                <span className="transition-all duration-200">{item.label}</span>
                                {active && <div className="ml-auto w-1 h-6 bg-white rounded-full"></div>}
                            </Link>
                        );
                    })}
                    {/* Admin Link specific handling if keeping /employees or new Admin Dashboard */}
                    {/* Re-adding Admin Panel specifically if it was separate, but assuming standard flow */}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="space-y-1">
                <Link
                    to="/settings"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive('/settings')
                        ? 'bg-primary text-white font-medium shadow-md'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-primary'
                        }`}
                >
                    <SettingsIcon size={20} className={`transition-transform duration-200 ${isActive('/settings') ? '' : 'group-hover:rotate-90'}`} />
                    <span>Settings</span>
                </Link>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-200 group"
                >
                    <LogOut size={20} className="transition-transform duration-200 group-hover:translate-x-1" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
