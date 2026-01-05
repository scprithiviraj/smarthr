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
        <div className="bg-white w-64 h-screen fixed px-4 pb-4 pt-2 border-r border-gray-100 flex flex-col justify-between transition-colors duration-200 font-sans shadow-soft">
            <div>
                <div className="flex items-center justify-start mb-6 pl-4 pt-2">
                    <div className="w-full h-auto">
                        <img src="/logo.png?v=2" alt="SmartHR Logo" className="w-full h-full object-contain object-left" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${active
                                    ? 'bg-primary text-white font-medium shadow-lg shadow-primary/25'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                                    }`}
                            >
                                <item.icon size={22} strokeWidth={active ? 2.5 : 2} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="font-heading tracking-wide text-[15px]">{item.label}</span>
                                {active && <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full"></div>}
                            </Link>
                        );
                    })}
                    {/* Admin Link specific handling if keeping /employees or new Admin Dashboard */}
                    {/* Re-adding Admin Panel specifically if it was separate, but assuming standard flow */}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="space-y-2">
                <Link
                    to="/settings"
                    className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive('/settings')
                        ? 'bg-primary text-white font-medium shadow-lg shadow-primary/25'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                        }`}
                >
                    <SettingsIcon size={22} className={`transition-transform duration-300 ${isActive('/settings') ? 'rotate-90' : 'group-hover:rotate-90'}`} />
                    <span className="font-heading text-[15px]">Settings</span>
                </Link>

                <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 hover:shadow-sm transition-all duration-300 group"
                >
                    <LogOut size={22} className="transition-transform duration-300 group-hover:translate-x-1" />
                    <span className="font-heading text-[15px]">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
