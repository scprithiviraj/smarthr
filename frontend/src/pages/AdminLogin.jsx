import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, logout, reset } from '../features/auth/authSlice';
import { Lock, Mail, Shield } from 'lucide-react';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const { username, password } = formData;
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            alert(message);
        }

        if (isSuccess || user) {
            if (user?.roles?.includes('ADMIN')) {
                navigate('/dashboard');
            } else {
                alert("Unauthorized: Access restricted to Administrators.");
                dispatch(logout());
                dispatch(reset());
            }
        }

        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(login(formData));
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Verifying Admin Credentials...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-blue-600">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-100 p-3 rounded-full mb-4">
                        <Shield className="text-blue-600" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-center text-gray-800">Admin Portal</h2>
                    <p className="text-gray-500 mt-2">Secure access for administrators</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <Mail size={20} />
                            </span>
                            <input
                                type="text"
                                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                id="username"
                                name="username"
                                value={username}
                                onChange={onChange}
                                placeholder="admin"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <Lock size={20} />
                            </span>
                            <input
                                type="password"
                                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                id="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-lg"
                    >
                        Login to Dashboard
                    </button>

                    <div className="text-center mt-6 pt-6 border-t border-gray-100">
                        <Link to="/login" className="text-sm text-gray-500 hover:text-gray-800 font-medium flex items-center justify-center space-x-1">
                            <span>← Back to Employee Login</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
