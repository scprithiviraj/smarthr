import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllEmployees } from '../features/employee/employeeSlice';
import { Users, Mail, Briefcase, Shield, Search, Filter } from 'lucide-react';

const Employees = () => {
    const dispatch = useDispatch();
    const { employees, isLoading } = useSelector((state) => state.employee);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(getAllEmployees());
    }, [dispatch]);

    const filteredEmployees = employees.filter(emp =>
        emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.fullName && emp.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Employees</h1>
                    <p className="text-slate-500 mt-1 text-lg">Manage all employee records and details.</p>
                </div>
                <div className="flex space-x-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-gray-100">
                            <tr>
                                <th className="p-6 pl-8">User</th>
                                <th className="p-6">Contact</th>
                                <th className="p-6">Role</th>
                                <th className="p-6">Designation</th>
                                <th className="p-6">Joined</th>
                                <th className="p-6 text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-500">Loading employees...</td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-500">No employees found.</td>
                                </tr>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-6 pl-8">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                                                    {employee.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-bold text-gray-900">{employee.username}</div>
                                                    <div className="text-xs text-slate-500">{employee.fullName || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center text-slate-600 font-medium">
                                                <Mail size={16} className="mr-2 text-slate-400" />
                                                {employee.email}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${employee.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                                                {employee.role}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center text-slate-600">
                                                <Briefcase size={16} className="mr-2 text-slate-400" />
                                                {employee.designation || 'Not Assigned'}
                                            </div>
                                        </td>
                                        <td className="p-6 text-slate-500 font-medium">
                                            {new Date(employee.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-6 text-right pr-8">
                                            <button className="text-slate-400 hover:text-primary transition-colors font-semibold text-sm">View</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Employees;
