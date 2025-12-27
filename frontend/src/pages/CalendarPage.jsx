import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getHistory } from '../features/attendance/attendanceSlice';
import { getMyLeaves } from '../features/leave/leaveSlice';

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Legend Data
    const legend = [
        { label: 'Present', color: 'bg-green-500', count: 9 },
        { label: 'Leave', color: 'bg-blue-500', count: 2 },
        { label: 'Holiday', color: 'bg-orange-400', count: 2 },
        { label: 'Half Day', color: 'bg-blue-400', count: 1 },
        { label: 'Absent', color: 'bg-red-500', count: 1 },
    ];

    // Calendar Grid Logic
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const dispatch = useDispatch();
    const { history } = useSelector((state) => state.attendance);
    const { leaves } = useSelector((state) => state.leave);

    useEffect(() => {
        dispatch(getHistory());
        dispatch(getMyLeaves());
    }, [dispatch]);

    // Map Backend Data to Calendar Events
    const events = {};

    // 1. Process Attendance
    if (history) {
        history.forEach(record => {
            const date = new Date(record.date);
            // Only if it matches current month/year view
            if (date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()) {
                const day = date.getDate();
                // Map backend status to UI status
                let status = 'Present';
                if (record.status === 'ABSENT') status = 'Absent';
                else if (record.status === 'HALF_DAY') status = 'Half Day';

                events[day] = status;
            }
        });
    }

    // 2. Process Leaves (Override attendance if on leave, or just add)
    if (leaves) {
        leaves.forEach(leave => {
            if (leave.status === 'APPROVED') {
                const start = new Date(leave.startDate);
                const end = new Date(leave.endDate);

                // Iterate dates between start and end
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
                        events[d.getDate()] = 'Leave';
                    }
                }
            }
        });
    }

    const getStatusColor = (day) => {
        const status = events[day];
        if (status === 'Present') return 'bg-green-500';
        if (status === 'Leave') return 'bg-blue-500';
        if (status === 'Holiday') return 'bg-orange-400';
        if (status === 'Half Day') return 'bg-blue-400';
        if (status === 'Absent') return 'bg-red-500';
        return null;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
            <p className="text-gray-500 -mt-4">View your attendance, leaves, and holidays.</p>

            {/* Legend */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {legend.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">{item.label}</p>
                            <p className="font-bold text-gray-800">{item.count}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Calendar View */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-bold text-gray-800">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <p className="text-sm text-gray-500">Your attendance calendar</p>
                    </div>
                    <div className="flex space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">Today</button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronLeft size={20} /></button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><ChevronRight size={20} /></button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-y-8 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-gray-400 text-sm font-medium uppercase">{day}</div>
                    ))}

                    {days.map((day, index) => (
                        <div key={index} className="h-16 flex flex-col items-center justify-start group relative">
                            {day && (
                                <>
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear() ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
                                        }`}>
                                        {day}
                                    </div>
                                    {getStatusColor(day) && (
                                        <div className={`w-1.5 h-1.5 rounded-full mt-2 ${getStatusColor(day)}`}></div>
                                    )}
                                </>
                            )}
                            {/* Today Indicator */}
                            {day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear() && (
                                <div className="absolute inset-0 border-2 border-blue-600 rounded-xl -m-2 opacity-50 pointer-events-none"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Upcoming Events</h3>
                <p className="text-sm text-gray-500 -mt-2 mb-6">Your scheduled leaves and holidays</p>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                        <div className="flex items-center space-x-4">
                            <div className="text-center px-4 border-r border-gray-100">
                                <p className="text-xs text-gray-500 uppercase font-bold">{new Date().toLocaleString('default', { month: 'short' })}</p>
                                <p className="text-xl font-bold text-gray-800">25</p>
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Team Outing</p>
                                <p className="text-xs text-gray-500">Office Event</p>
                            </div>
                        </div>
                        <span className="bg-blue-400 text-white text-xs font-bold px-3 py-1 rounded-full">Event</span>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                        <div className="flex items-center space-x-4">
                            <div className="text-center px-4 border-r border-gray-100">
                                <p className="text-xs text-gray-500 uppercase font-bold">{new Date().toLocaleString('default', { month: 'short' })}</p>
                                <p className="text-xl font-bold text-gray-800">28</p>
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Month End</p>
                                <p className="text-xs text-gray-500">Report Submission</p>
                            </div>
                        </div>
                        <span className="bg-purple-400 text-white text-xs font-bold px-3 py-1 rounded-full">Reminder</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CalendarPage;
