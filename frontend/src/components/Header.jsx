import { useState, useEffect } from 'react';
import { Search, Bell, X, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { getMyLeaves } from '../features/leave/leaveSlice';

const Header = () => {
    const { user } = useSelector((state) => state.auth);
    const { leaves } = useSelector((state) => state.leave);
    const dispatch = useDispatch();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (user && !user.roles?.includes('ADMIN')) {
            dispatch(getMyLeaves());
        }
    }, [dispatch, user]);

    useEffect(() => {
        if (leaves && leaves.length > 0) {
            const newNotifs = leaves
                .filter(l => l.status !== 'PENDING') // Only notify for decisions
                .slice(0, 5) // Last 5
                .map((leave, index) => ({
                    id: leave.id || index,
                    type: leave.status === 'APPROVED' ? 'success' : 'warning',
                    title: `Leave ${leave.status}`,
                    message: `Your ${leave.leaveType} leave application has been ${leave.status.toLowerCase()}.`,
                    time: new Date(leave.updatedAt || Date.now()).toLocaleDateString(), // Mock time if missing
                    read: false
                }));
            setNotifications(newNotifs);
        }
    }, [leaves]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleBellClick = () => {
        setShowNotifications(!showNotifications);
        // Optional: Mark all as read when opening
        // setNotifications(notifications.map(n => ({...n, read: true})));
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
            case 'info': default: return <Info size={16} className="text-blue-500" />;
        }
    };

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Debug logging
    useEffect(() => {
        console.log("Current User:", user);
        if (user?.profilePicture) {
            console.log("Profile Pic URL:", `http://localhost:8080/api/users/avatars/${user.profilePicture}`);
        }
    }, [user]);

    // ... existing logic ...

    return (
        <header className="bg-white border-b py-3 px-8 flex justify-between items-center sticky top-0 z-20">
            {/* Search */}
            <div className="relative w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={18} />
                </div>
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-6">
                {/* ID: Date Time Display */}
                <div className="hidden md:block text-right mr-4">
                    <p className="text-sm font-bold text-gray-800">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-xs text-gray-500">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {/* Icons */}
                <div className="flex items-center space-x-4 relative">
                    <button
                        onClick={handleBellClick}
                        className="relative text-gray-500 hover:text-gray-700 transition-all duration-200 outline-none"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold ring-2 ring-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute top-10 right-0 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-800">Notifications</h3>
                                <div className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}>
                                    Mark all read
                                </div>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 border-b last:border-0 hover:bg-gray-50 transition flex items-start space-x-3 ${!notif.read ? 'bg-blue-50/50' : ''}`}
                                        >
                                            <div className="mt-0.5">{getIcon(notif.type)}</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`text-sm font-semibold ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>{notif.title}</h4>
                                                    <button onClick={() => deleteNotification(notif.id)} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{notif.message}</p>
                                                <p className="text-[10px] text-gray-400 mt-2">{notif.time}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        No new notifications
                                    </div>
                                )}
                            </div>
                            <div className="p-2 text-center border-t bg-gray-50">
                                <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">View All</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3 pl-6 border-l">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                        {user?.profilePicture ? (
                            <img src={`http://localhost:8080/api/users/avatars/${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'
                        )}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold text-gray-800 leading-none">{user?.fullName || 'Guest'}</p>
                        <p className="text-xs text-gray-500 mt-1">{user?.roles?.includes('ADMIN') ? 'Admin' : 'Employee'}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
