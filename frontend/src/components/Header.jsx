import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSelector } from 'react-redux';

const Header = () => {
    const { user } = useSelector((state) => state.auth);
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
                    {/* Notification Button Removed */}
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
