import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getHistory } from '../features/attendance/attendanceSlice';
import { getMyLeaves } from '../features/leave/leaveSlice';

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

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
                else if (record.status === 'LATE') status = 'Late';

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
        if (status === 'Present') return 'bg-emerald-100 text-emerald-700 border-2 border-white';
        if (status === 'Leave') return 'bg-blue-100 text-blue-700 border-2 border-white';
        if (status === 'Half Day') return 'bg-amber-100 text-amber-700 border-2 border-white';
        if (status === 'Late') return 'bg-amber-100 text-amber-700 border-2 border-white';
        if (status === 'Absent') return 'bg-rose-100 text-rose-700 border-2 border-white';
        return 'hover:bg-gray-50 text-gray-700';
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Calendar</h1>
                    <p className="text-slate-500 mt-1 text-lg">View your attendance and leave schedule.</p>
                </div>
                <button
                    onClick={goToToday}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Today
                </button>
            </div>

            {/* Calendar View */}
            <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <CalendarIcon size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 font-heading">
                            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                        </h2>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Grid Header */}
                <div className="grid grid-cols-7 mb-4">
                    {weekDays.map((day) => (
                        <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid Body */}
                <div className="grid grid-cols-7 gap-2">
                    {days.map((day, index) => (
                        <div
                            key={index}
                            className={`
                                h-24 sm:h-32 rounded-2xl flex flex-col items-start justify-start p-3 transition-all relative group
                                ${day === null ? 'bg-transparent' : 'bg-slate-50/50 border border-transparent hover:border-gray-200 hover:shadow-sm'}
                                ${day && events[day] ? getStatusColor(day) : ''}
                                ${(!day) ? '' : 'cursor-pointer'}
                            `}
                        >
                            {day && (
                                <>
                                    <span className={`text-sm font-bold mb-1 ${events[day] ? 'opacity-100' : 'text-gray-400'}`}>{day}</span>
                                    {events[day] && (
                                        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-white/50 backdrop-blur-sm mt-auto w-full text-center truncate shadow-sm">
                                            {events[day]}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-6 items-center justify-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                        <span className="text-sm font-medium text-slate-600">Present</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                        <span className="text-sm font-medium text-slate-600">Leave</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm"></div>
                        <span className="text-sm font-medium text-slate-600">Late / Half Day</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm"></div>
                        <span className="text-sm font-medium text-slate-600">Absent</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
