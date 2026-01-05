import { useState, useRef } from 'react';
import { User, Bell, Lock, Camera, Upload, Trash2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUser, updateProfile, changePassword, logout } from '../features/auth/authSlice';
import api from '../utils/axios';

const Settings = () => {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('profile');
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
    ];

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File size exceeds 2MB");
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await api.post(`/users/${user.id}/avatar`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                // Dispatch update to Redux store instead of reloading
                dispatch(updateUser({ profilePicture: response.data.profilePicture }));

                alert("Profile picture updated successfully!");
            } catch (error) {
                console.error("Upload error", error);
                alert("Failed to upload profile picture");
            }
        }
    };

    const handleRemovePhoto = async () => {
        if (!user.profilePicture) return;

        if (!window.confirm("Are you sure you want to remove your profile photo?")) {
            return;
        }

        try {
            await api.delete(`/users/${user.id}/avatar`);
            // Dispatch update to Redux store
            dispatch(updateUser({ profilePicture: null }));
            alert("Profile picture removed successfully!");
        } catch (error) {
            console.error("Remove error", error);
            alert("Failed to remove profile picture: " + (error.response?.data || error.message));
        }
    };

    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        hourlyRate: user?.hourlyRate || 0.0,
        // Add other fields mapped to user object
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        dispatch(updateProfile({ id: user.id, userData: formData }))
            .unwrap()
            .then(() => {
                alert("Profile updated successfully!");
            })
            .catch((error) => {
                alert(`Failed to update profile: ${error}`);
            });
    };

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleChangePasswordSubmit = () => {
        console.log("Submitting password change...", { id: user.id, ...passwordData });
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match");
            return;
        }
        dispatch(changePassword({
            id: user.id,
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        }))
            .unwrap()
            .then((data) => {
                console.log("Password change success:", data);
                alert("Password changed successfully");
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            })
            .catch((error) => {
                console.error("Password change failed:", error);
                alert(`Failed to change password: ${error.message || error}`);
            });
    };

    const handleResetSystem = async () => {
        if (!window.confirm("ARE YOU SURE? This will delete ALL users, attendance logs, and leave requests. Ideally used for testing/demos. This action cannot be undone.")) {
            return;
        }

        try {
            await api.delete('/users/reset');
            alert("System reset successfully. You will be logged out.");
            dispatch(logout());
            navigate('/login');
        } catch (error) {
            console.error("Reset failed", error);
            alert("Failed to reset system: " + (error.response?.data || error.message));
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Settings</h1>
                <p className="text-slate-500 mt-1 text-lg">Manage your account settings and preferences.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
                {/* Sidebar / Tabs */}
                <div className="w-full md:w-64 bg-slate-50/50 border-r border-gray-100 p-4">
                    <div className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-white text-primary shadow-sm ring-1 ring-gray-100'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                                    }`}
                            >
                                <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 md:p-10">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-fade-in-up max-w-2xl">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 font-heading">Profile Information</h3>
                                <p className="text-sm text-slate-500 mt-1">Update your personal details and profile picture</p>
                            </div>

                            <div className="flex items-center space-x-8">
                                <div className="relative group">
                                    <div className="w-28 h-28 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-3xl font-bold overflow-hidden border-4 border-white shadow-lg group-hover:shadow-glow transition-all duration-300">
                                        {user?.profilePicture ? (
                                            <img src={`http://localhost:8080/api/users/avatars/${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : user?.username?.substring(0, 2).toUpperCase() || 'SJ'
                                        )}
                                    </div>
                                    <button
                                        onClick={handleUploadClick}
                                        className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-md hover:bg-primary-dark transition-colors"
                                        title="Change Avatar"
                                    >
                                        <Camera size={16} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/gif"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">Profile Photo</p>
                                        <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG or GIF (max 2MB)</p>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleUploadClick}
                                            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition uppercase tracking-wide"
                                        >
                                            <Upload size={14} />
                                            <span>Upload</span>
                                        </button>
                                        <button
                                            onClick={handleRemovePhoto}
                                            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition uppercase tracking-wide"
                                        >
                                            <Trash2 size={14} />
                                            <span>Remove</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">Full Name</label>
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="w-full p-4 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employee ID</label>
                                    <input type="text" defaultValue={user?.id ? `EMP${String(user.id).padStart(3, '0')}` : "EMP001"} disabled className="w-full p-4 border border-gray-200 rounded-xl text-gray-400 bg-gray-100 outline-none cursor-not-allowed font-mono text-sm" />
                                </div>
                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@company.com" className="w-full p-4 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                                </div>
                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">Phone Number</label>
                                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+1 (555) 123-4567" className="w-full p-4 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                                </div>
                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">Hourly Rate ($)</label>
                                    <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} placeholder="0.00" className="w-full p-4 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                                </div>
                                <div className="md:col-span-2 group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                                    <input type="text" defaultValue="Engineering" className="w-full p-4 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-slate-50 focus:bg-white" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button onClick={handleSave} className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-1">Save Changes</button>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-8 animate-fade-in-up max-w-2xl">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 font-heading">Notification Preferences</h3>
                                <p className="text-sm text-slate-500 mt-1">Choose how you want to be notified</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { title: 'Email Notifications', desc: 'Receive notifications via email', default: true },
                                    { title: 'Leave Approvals', desc: 'Get notified when your leave is approved/rejected', default: true },
                                    { title: 'Attendance Reminders', desc: 'Daily reminders for punch in/out', default: true },
                                    { title: 'Weekly Reports', desc: 'Receive weekly attendance reports', default: false },
                                    { title: 'Push Notifications', desc: 'Receive push notifications on your device', default: true },
                                ].map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4">
                                <button className="bg-white border border-gray-200 text-gray-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-50 transition-all shadow-sm">Reset to Default</button>
                                <button className="ml-4 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-1">Save Preferences</button>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-fade-in-up max-w-2xl">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 font-heading">Security</h3>
                                <p className="text-sm text-slate-500 mt-1">Manage your password and account security</p>
                            </div>

                            {user?.roles?.includes('ADMIN') && (
                                <div className="p-6 border border-red-100 bg-red-50 rounded-2xl">
                                    <h4 className="font-bold text-red-700 mb-2">Reset System Data</h4>
                                    <p className="text-sm text-red-600 mb-4">This action will delete all users, leaves, and attendance records. This is intended for testing purposes only.</p>
                                    <button
                                        onClick={handleResetSystem}
                                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2.5 px-6 rounded-lg shadow-md shadow-red-200 transition-all hover:shadow-lg"
                                    >
                                        Reset Everything
                                    </button>
                                </div>
                            )}

                            <div className="space-y-6 pt-4 border-t border-gray-100">
                                <h4 className="font-bold text-gray-800">Change Password</h4>
                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full p-4 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-slate-50 focus:bg-white"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full p-4 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-slate-50 focus:bg-white"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full p-4 border border-gray-200 rounded-xl text-gray-700 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-slate-50 focus:bg-white"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleChangePasswordSubmit}
                                        className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-1"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Settings;
