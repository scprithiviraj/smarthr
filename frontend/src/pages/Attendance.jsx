

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkIn, checkOut, getHistory, reset, requestLatePunchIn } from '../features/attendance/attendanceSlice';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const Attendance = () => {
    const dispatch = useDispatch();
    const { history, isLoading } = useSelector((state) => state.attendance);
    const [showLateModal, setShowLateModal] = React.useState(false);
    const [lateReason, setLateReason] = React.useState('');

    useEffect(() => {
        dispatch(getHistory());
        return () => {
            dispatch(reset());
        }
    }, [dispatch]);

    const todayRecord = history.find(r => new Date(r.date).toDateString() === new Date().toDateString());
    const isCheckedIn = todayRecord && todayRecord.clockInTime && !todayRecord.clockOutTime;
    const isCheckedOut = todayRecord && todayRecord.clockOutTime;

    const handleCheckIn = () => {
        if (isCheckedIn || isCheckedOut) {
            alert("You have already punched in for today.");
            return;
        }

        const now = new Date();
        const hour = now.getHours();

        // 1. Before 9:00 AM -> Block
        if (hour < 9) {
            alert("Punch-in is enabled only after 9:00 AM.");
            return;
        }

        dispatch(checkIn())
            .unwrap()
            .then(() => dispatch(getHistory()))
            .catch((error) => {
                const msg = typeof error === 'string' ? error : error.message || 'Unknown error';
                if (msg === 'LATE_APPROVAL_REQUIRED') {
                    setShowLateModal(true);
                } else if (msg === 'LATE_APPROVAL_PENDING') {
                    alert("Your late punch-in request is still pending approval.");
                } else if (msg === 'LATE_REQUEST_REJECTED') {
                    alert("Your late punch-in request was rejected. You cannot punch in today.");
                } else {
                    alert(`Punch-in failed: ${msg}`);
                }
            });
    }

    const submitLateRequest = () => {
        if (!lateReason.trim()) return alert("Please provide a reason.");
        dispatch(requestLatePunchIn(lateReason))
            .unwrap()
            .then(() => {
                alert("Request submitted successfully. Please wait for admin approval.");
                setShowLateModal(false);
                setLateReason('');
            })
            .catch(err => alert("Failed to submit request: " + (err.message || err)));
    }

    const handleCheckOut = () => {
        if (!isCheckedIn) {
            alert("You need to punch in first.");
            return;
        }
        if (isCheckedOut) {
            alert("You have already punched out for today.");
            return;
        }

        const now = new Date();
        const hour = now.getHours();

        // 3. Before 6:00 PM (18:00) -> Warn (Half Day)
        if (hour < 18) {
            if (!window.confirm("It is before 6:00 PM. Punching out now will be marked as 'HALF DAY'. Proceed?")) {
                return;
            }
        }

        dispatch(checkOut())
            .unwrap()
            .then(() => dispatch(getHistory()))
            .catch((error) => {
                alert(`Punch-out failed: ${typeof error === 'string' ? error : error.message || 'Unknown error'}`);
            });
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
        <div className="space-y-8 animate-fade-in-up relative">
            {/* Late Request Modal */}
            {showLateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform scale-100 transition-all">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Late Entry Request</h3>
                        <p className="text-gray-600 mb-6">You are punching in late (after 9:05 AM). Please provide a reason for admin approval.</p>

                        <textarea
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-gray-50 mb-6"
                            rows="4"
                            placeholder="Reason for being late..."
                            value={lateReason}
                            onChange={(e) => setLateReason(e.target.value)}
                        ></textarea>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLateModal(false)}
                                className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitLateRequest}
                                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Attendance</h1>
                <p className="text-slate-500 mt-1 text-lg">Track your daily attendance and working hours.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timer Section */}
                <div className="lg:col-span-2 bg-white p-10 rounded-3xl shadow-soft border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <Clock size={120} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 self-start mb-1 font-heading">Today's Attendance</h3>
                    <p className="text-slate-500 self-start mb-10 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    {/* Circle Timer */}
                    <div className="relative w-56 h-56 flex items-center justify-center mb-10">
                        {/* Outer Ring */}
                        <div className="absolute inset-0 rounded-full border-[6px] border-slate-50 shadow-inner"></div>
                        {/* Progress Ring (Static for visual) */}
                        <div className="absolute inset-0 rounded-full border-[6px] border-primary border-t-transparent border-r-transparent transform -rotate-45" style={{ clipPath: 'circle(50% at 50% 50%)' }}></div>

                        {/* Inner Circle with Shadow */}
                        <div className="bg-white w-44 h-44 rounded-full flex items-center justify-center shadow-lg border border-slate-50 z-10">
                            <Clock className="text-primary" size={64} strokeWidth={1.5} />
                        </div>

                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl"></div>
                    </div>

                    <div className="space-y-1 mb-10">
                        <h2 className="text-6xl font-bold text-gray-900 font-mono tracking-tight">{time.toLocaleTimeString('en-US', { hour12: false })}</h2>
                        <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Local Time</p>
                    </div>

                    <div className="flex space-x-6 w-full max-w-md">
                        <button
                            onClick={handleCheckIn}
                            disabled={isCheckedIn}
                            className={`flex-1 group relative px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center space-x-3 overflow-hidden ${isCheckedIn ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400'}`}
                        >
                            <span className="relative z-10 text-lg">Punch In</span>
                            {!isCheckedIn && <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>}
                        </button>

                        <button
                            onClick={handleCheckOut}
                            disabled={!isCheckedIn || isCheckedOut}
                            className={`flex-1 group relative px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center space-x-3 overflow-hidden ${(!isCheckedIn || isCheckedOut) ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none' : 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400'}`}
                        >
                            <span className="relative z-10 text-lg">Punch Out</span>
                        </button>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100 flex flex-col h-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading">Summary</h3>
                    <p className="text-slate-500 text-sm mb-8">This month's overview</p>

                    <div className="space-y-5 flex-1">
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:bg-white hover:shadow-sm">
                            <span className="text-slate-600 font-medium">Present Days</span>
                            <span className="text-emerald-600 font-bold text-lg">{presentDays}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:bg-white hover:shadow-sm">
                            <span className="text-slate-600 font-medium">Absent Days</span>
                            <span className="text-rose-600 font-bold text-lg">{absentDays}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:bg-white hover:shadow-sm">
                            <span className="text-slate-600 font-medium">Half Days</span>
                            <span className="text-amber-600 font-bold text-lg">{halfDays}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:bg-white hover:shadow-sm">
                            <span className="text-slate-600 font-medium">Leaves Taken</span>
                            <span className="text-blue-600 font-bold text-lg">{leavesTaken}</span>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-50 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Total Hours</span>
                            <span className="font-bold text-gray-900 font-mono">142:30</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Avg. per Day</span>
                            <span className="font-bold text-gray-900 font-mono">09:28</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 font-heading">Attendance History</h3>
                        <p className="text-slate-500 text-sm mt-1">Your attendance records for the past week</p>
                    </div>
                    {/* Optional Report Button */}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="p-5 font-semibold pl-8">Date</th>
                                <th className="p-5 font-semibold">In Time</th>
                                <th className="p-5 font-semibold">Out Time</th>
                                <th className="p-5 font-semibold">Total Hours</th>
                                <th className="p-5 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {history.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-5 pl-8 font-medium text-gray-900">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="p-5 text-slate-600 font-mono text-xs">
                                        {record.clockInTime ? new Date(record.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="p-5 text-slate-600 font-mono text-xs">
                                        {record.clockOutTime ? new Date(record.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="p-5 text-slate-800 font-bold font-mono">
                                        {record.totalHours ? record.totalHours.toFixed(2) : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1 ${record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
                                            record.status === 'ABSENT' ? 'bg-rose-100 text-rose-700' :
                                                record.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-amber-100 text-amber-700'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'PRESENT' ? 'bg-emerald-500' : record.status === 'ABSENT' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
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
