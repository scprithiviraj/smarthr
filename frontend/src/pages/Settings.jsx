import { useState, useRef } from 'react';
import { User, Bell, Lock, Camera, Upload } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser, updateProfile, changePassword } from '../features/auth/authSlice';
import api from '../utils/axios';

const Settings = () => {
    const { user } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('profile');
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
    ];

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const dispatch = useDispatch(); // Add this hook

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

    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-500 -mt-4">Manage your account settings and preferences.</p>

            {/* Tabs */}
            <div className="flex space-x-2 border-b">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-6 py-3 font-medium text-sm rounded-t-lg transition ${activeTab === tab.id
                            ? 'bg-gray-100 text-gray-800'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white p-8 rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-100">

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Profile Information</h3>
                            <p className="text-sm text-gray-500">Update your personal details and profile picture</p>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold overflow-hidden border-4 border-white shadow-sm">
                                {user?.profilePicture ? (
                                    <img src={`http://localhost:8080/api/users/avatars/${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user?.fullName ? user.fullName.substring(0, 2).toUpperCase() : user?.username?.substring(0, 2).toUpperCase() || 'SJ'
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/png, image/jpeg, image/gif"
                            />
                            <button
                                onClick={handleUploadClick}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                            >
                                <Upload size={16} />
                                <span>Upload Photo</span>
                            </button>
                            <p className="text-xs text-gray-400">JPG, PNG or GIF (max 2MB)</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                                <input type="text" defaultValue={user?.id ? `EMP${String(user.id).padStart(3, '0')}` : "EMP001"} disabled className="w-full p-3 border border-gray-200 rounded-lg text-gray-500 bg-gray-50 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@company.com" className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+1 (555) 123-4567" className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                <input type="text" defaultValue="Engineering" className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition">Save Changes</button>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Notification Preferences</h3>
                            <p className="text-sm text-gray-500">Choose how you want to be notified</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { title: 'Email Notifications', desc: 'Receive notifications via email', default: true },
                                { title: 'Leave Approvals', desc: 'Get notified when your leave is approved/rejected', default: true },
                                { title: 'Attendance Reminders', desc: 'Daily reminders for punch in/out', default: true },
                                { title: 'Weekly Reports', desc: 'Receive weekly attendance reports', default: false },
                                { title: 'Push Notifications', desc: 'Receive push notifications on your device', default: true },
                            ].map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
                                    <div>
                                        <h4 className="font-medium text-gray-800">{item.title}</h4>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition">Save Preferences</button>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Change Password</h3>
                            <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                        </div>

                        <div className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleChangePasswordSubmit}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition"
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>

                        <div className="pt-8 border-t">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-gray-800">Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                                    <p className="text-sm text-gray-500 mt-2">Enable 2FA<br />Require a verification code in addition to your password</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="pt-8 border-t">
                            <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                <h4 className="font-bold text-red-800 mb-2">Reset System Data</h4>
                                <p className="text-sm text-red-600 mb-4">
                                    This action will delete ALL users (except Admin), leave requests, attendance logs, and departments.
                                    The User ID sequence will be reset to 1. This action cannot be undone.
                                </p>
                                <button
                                    onClick={async () => {
                                        if (confirm("Are you ABSOLUTELY SURE? This will wipe all data!")) {
                                            try {
                                                await api.delete('/users/reset');
                                                alert("System reset successful. You will be logged out.");
                                                localStorage.clear();
                                                window.location.href = '/login';
                                            } catch (error) {
                                                console.error(error);
                                                alert("Failed to reset system: " + (error.response?.data || error.message));
                                            }
                                        }
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition"
                                >
                                    Reset System Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Settings;
