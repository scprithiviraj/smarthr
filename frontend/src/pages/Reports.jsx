import { useState } from 'react';
import { FileText, Calendar, Clock, BarChart, Download, Filter } from 'lucide-react';
import api from '../utils/axios';

import { useSelector } from 'react-redux';

const Reports = () => {
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.roles?.includes('ADMIN');

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async (type) => {
        setIsLoading(true);
        try {
            let endpoint = '';
            if (isAdmin) {
                switch (type) {
                    case 'attendance': endpoint = '/reports/admin/attendance'; break;
                    case 'leave': endpoint = '/reports/admin/leave'; break;
                    case 'payroll': endpoint = '/reports/payroll'; break;
                    case 'late': endpoint = '/reports/late-in'; break;
                    default: return;
                }
            } else {
                endpoint = type === 'attendance' ? '/reports/attendance' : '/reports/leave';
            }
            const response = await api.get(`${endpoint}?month=${month}&year=${year}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report_${month}_${year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Failed to download report", error);
            alert("Failed to download report");
        }
        setIsLoading(false);
    };

    const reportTypes = [
        { id: 'attendance', title: isAdmin ? 'Org. Attendance Report' : 'My Attendance Report', desc: isAdmin ? 'Monthly attendance logs of all employees' : 'Your monthly attendance logs', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'leave', title: isAdmin ? 'Org. Leave Report' : 'My Leave Report', desc: isAdmin ? 'Summary of all employee leaves' : 'Summary of your leaves', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ].filter(r => isAdmin || !r.adminOnly);

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Reports</h1>
                    <p className="text-slate-500 mt-1 text-lg">Generate and download system reports.</p>
                </div>
            </div>

            {/* Report Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportTypes.map((report, index) => (
                    <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft flex items-start space-x-4 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        <div className={`p-4 rounded-2xl ${report.bg} ${report.color} group-hover:scale-110 transition-transform`}>
                            <report.icon size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{report.title}</h3>
                            <p className="text-slate-500 text-sm mt-1">{report.desc}</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => handleDownload(report.id)}
                                    className="flex items-center space-x-2 text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-all w-full justify-center"
                                >
                                    <Download size={16} />
                                    <span>Download PDF</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Generate Custom Report Form */}
            <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100 max-w-lg">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                        <Filter size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Report Settings</h3>
                        <p className="text-xs text-slate-500">Configure range for reports</p>
                    </div>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">Month</label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-slate-50 focus:bg-white font-medium text-gray-700"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                        </div>
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-primary transition-colors">Year</label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-slate-50 focus:bg-white font-medium text-gray-700"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Reports;
