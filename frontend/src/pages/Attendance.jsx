import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkIn, checkOut, getHistory, reset } from '../features/attendance/attendanceSlice';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const Attendance = () => {
    const dispatch = useDispatch();
    const { history, isLoading } = useSelector((state) => state.attendance);

    useEffect(() => {
        dispatch(getHistory());
        return () => {
            dispatch(reset());
        }
    }, [dispatch]);

    const handleCheckIn = () => {
        dispatch(checkIn()).then(() => dispatch(getHistory()));
    }

    const handleCheckOut = () => {
        dispatch(checkOut()).then(() => dispatch(getHistory()));
    }

    // Timer Logic (Visual Only for now, could be real-time)
    const [time, setTime] = React.useState(new Date());
    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Summary Calculations (Mocked or derived)
    const presentDays = history.filter(r => r.status === 'PRESENT').length;
    const absentDays = history.filter(r => r.status === 'ABSENT').length;
    const halfDays = history.filter(r => r.status === 'HALF_DAY').length || 0;
    const leavesTaken = 3; // Mocked

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
            <p className="text-gray-500 -mt-4">Track your daily attendance and working hours.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Timer Section */}
                <div className="lg:col-span-2 bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-bold text-gray-800 self-start mb-6">Today's Attendance</h3>
                    <p className="text-gray-500 self-start -mt-6 mb-10">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    {/* Circle Timer */}
                    <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                        {/* Outer Ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                        {/* Progress Ring (Static for visual) */}
                        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent border-r-transparent transform -rotate-45" style={{ clipPath: 'circle(50% at 50% 50%)' }}></div>

                        <div className="bg-blue-50 w-36 h-36 rounded-full flex items-center justify-center">
                            <Clock className="text-blue-600" size={48} />
                        </div>
                    </div>

                    <div className="space-y-2 mb-8">
                        <h2 className="text-4xl font-bold text-gray-800">{time.toLocaleTimeString('en-US', { hour12: false })}</h2>
                        <p className="text-gray-500">Ready to start?</p>
                    </div>

                    <div className="flex space-x-4">
                        <button onClick={handleCheckIn} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center space-x-2 transition shadow-lg shadow-blue-200">
                            <span>Punch In</span>
                        </button>
                        <button onClick={handleCheckOut} className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center space-x-2 transition shadow-lg shadow-red-200">
                            <span>Punch Out</span>
                        </button>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Summary</h3>
                    <p className="text-gray-500 text-sm -mt-5 mb-6">This month's overview</p>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600 font-medium">Present Days</span>
                            <span className="text-gray-900 font-bold">{presentDays}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600 font-medium">Absent Days</span>
                            <span className="text-gray-900 font-bold">{absentDays}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600 font-medium">Half Days</span>
                            <span className="text-gray-900 font-bold">{halfDays}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600 font-medium">Leaves Taken</span>
                            <span className="text-gray-900 font-bold">{leavesTaken}</span>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Total Hours</span>
                            <span className="font-semibold text-gray-800">142:30</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Avg. per Day</span>
                            <span className="font-semibold text-gray-800">09:28</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-gray-800">Attendance History</h3>
                    <p className="text-gray-500 text-sm mt-1">Your attendance records for the past week</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                            <tr>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">In Time</th>
                                <th className="p-4 font-semibold">Out Time</th>
                                <th className="p-4 font-semibold">Total Hours</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {history.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-800">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="p-4 text-gray-600">{record.clockInTime ? new Date(record.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                    <td className="p-4 text-gray-600">{record.clockOutTime ? new Date(record.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                    <td className="p-4 text-gray-600">{record.totalHours ? record.totalHours.toFixed(2) : '-'}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${record.status === 'PRESENT' ? 'bg-green-100 text-green-600' :
                                            record.status === 'ABSENT' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
