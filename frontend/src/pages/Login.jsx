import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, logout, reset } from '../features/auth/authSlice';
import { Lock, Mail } from 'lucide-react';

const Login = () => {
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
            if (user?.roles?.includes('EMPLOYEE')) {
                navigate('/dashboard');
            } else if (user?.roles?.includes('ADMIN')) {
                alert("Please use the Admin Login portal.");
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
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-primary-dark mb-8">SmartHR Login</h2>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <Mail size={20} />
                            </span>
                            <input
                                type="text"
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                id="username"
                                name="username"
                                value={username}
                                onChange={onChange}
                                placeholder="Enter your username"
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
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                id="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                placeholder="Enter password"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                    >
                        Sign In
                    </button>
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-600">
                            <Link to="/register" className="text-primary hover:underline font-medium">Create Account</Link>
                        </p>
                        <Link to="/admin-login" className="text-sm text-gray-500 hover:text-gray-800">Admin Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
