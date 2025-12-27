import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Briefcase, Building } from 'lucide-react';
import api from '../utils/axios'; // Direct API call for signup or create a thunk

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        designation: '',
        role: 'EMPLOYEE' // Default
    });

    const { username, email, password, fullName, designation } = formData;
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.post('/auth/signup', formData);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-center text-primary-dark">Create Account</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or <Link to="/login" className="font-medium text-primary hover:text-primary-dark">sign in to your existing account</Link>
                    </p>
                </div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>}
                {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">{success}</div>}

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><User size={20} /></span>
                            <input type="text" name="username" value={username} onChange={onChange} placeholder="Username" required className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><User size={20} /></span>
                            <input type="text" name="fullName" value={fullName} onChange={onChange} placeholder="Full Name" required className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Mail size={20} /></span>
                            <input type="email" name="email" value={email} onChange={onChange} placeholder="Email Address" required className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Briefcase size={20} /></span>
                            <input type="text" name="designation" value={designation} onChange={onChange} placeholder="Designation" className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-primary" />
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Lock size={20} /></span>
                            <input type="password" name="password" value={password} onChange={onChange} placeholder="Password (min 6 chars)" required className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-primary" minLength="6" />
                        </div>

                        {/* Optional: Role Selection for Demo purposes */}
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                                <input type="radio" name="role" value="EMPLOYEE" checked={formData.role === 'EMPLOYEE'} onChange={onChange} className="mr-2" />
                                Employee
                            </label>
                            <label className="flex items-center">
                                <input type="radio" name="role" value="ADMIN" checked={formData.role === 'ADMIN'} onChange={onChange} className="mr-2" />
                                Admin
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition duration-200">
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
