import { useState } from 'react';
import { FileText, Calendar, Clock, BarChart, Download } from 'lucide-react';
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
        { id: 'attendance', title: isAdmin ? 'Org. Attendance Report' : 'My Attendance Report', desc: isAdmin ? 'Monthly attendance logs of all employees' : 'Your monthly attendance logs', icon: FileText, color: 'bg-blue-100', text: 'text-blue-600' },
        { id: 'leave', title: isAdmin ? 'Org. Leave Report' : 'My Leave Report', desc: isAdmin ? 'Summary of all employee leaves' : 'Summary of your leaves', icon: Calendar, color: 'bg-green-100', text: 'text-green-600' },
        { id: 'payroll', title: 'Payroll Report', desc: 'Generated payroll sheets for the month', icon: BarChart, color: 'bg-purple-100', text: 'text-purple-600', adminOnly: true },
        { id: 'late', title: 'Late In Report', desc: 'List of employees checking in late', icon: Clock, color: 'bg-orange-100', text: 'text-orange-600', adminOnly: true },
    ].filter(r => isAdmin || !r.adminOnly);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
                    <p className="text-gray-500 mt-1">Generate and download system reports.</p>
                </div>
            </div>

            {/* Report Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportTypes.map((report, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4 hover:shadow-md transition cursor-pointer group">
                        <div className={`p-3 rounded-xl ${report.color} ${report.text} group-hover:scale-105 transition`}>
                            <report.icon size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800">{report.title}</h3>
                            <p className="text-gray-500 text-sm mt-1">{report.desc}</p>
                            <div className="mt-4 flex items-center space-x-4">
                                <button
                                    onClick={() => handleDownload(report.id)}
                                    className="flex items-center space-x-2 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                                >
                                    <Download size={14} />
                                    <span>Download PDF</span>
                                </button>
                                <button className="flex items-center space-x-2 text-sm font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
                                    <FileText size={14} />
                                    <span>View CVS</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Attendance Report Download Form (Functional) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-md">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Generate Custom Report</h3>
                <form onSubmit={handleDownload} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-100 outline-none"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-100 outline-none"
                                min="2000"
                                max="2100"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition disabled:bg-gray-400"
                    >
                        {isLoading ? 'Generating...' : 'Download PDF'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Reports;
