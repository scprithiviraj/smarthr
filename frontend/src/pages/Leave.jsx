import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyLeave, getMyLeaves, reset } from '../features/leave/leaveSlice';
import { Clock } from 'lucide-react';

const Leave = () => {
    const dispatch = useDispatch();
    const { leaves } = useSelector((state) => state.leave);

    const [formData, setFormData] = useState({
        leaveType: 'SICK',
        startDate: '',
        endDate: '',
        reason: ''
    });



    const handleSubmit = (e) => {
        e.preventDefault();

        // Date Validation
        // Date Validation - Using String Comparison for robustness against offsets
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        if (formData.startDate < todayStr) {
            alert("Start date cannot be in the past.");
            return;
        }
        if (formData.endDate < todayStr) {
            alert("End date cannot be in the past.");
            return;
        }
        if (formData.endDate < formData.startDate) {
            alert("End date cannot be before start date.");
            return;
        }

        // Casual Leave Limit Validation
        if (formData.leaveType === 'CASUAL') {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            if (diffDays > 3) {
                alert("Casual leave cannot exceed 3 consecutive days.");
                return;
            }
        }

        const data = new FormData();
        const leaveRequest = {
            leaveType: formData.leaveType,
            startDate: formData.startDate,
            endDate: formData.endDate,
            reason: formData.reason
        };
        data.append('leaveRequest', new Blob([JSON.stringify(leaveRequest)], { type: 'application/json' }));
        dispatch(applyLeave(data)).then(() => {
            alert("Leave application submitted!"); // Feedback
            setFormData({ leaveType: 'SICK', startDate: '', endDate: '', reason: '' });
        });
    };

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Data for right side
    const leaveBalance = [
        { type: 'Casual Leave', days: '7 days' },
        { type: 'Sick Leave', days: '5 days' },
        { type: 'Earned Leave', days: '12 days' },
        { type: 'Maternity Leave', days: '90 days' },
        { type: 'Paternity Leave', days: '15 days' },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Apply Leave</h1>
                <p className="text-slate-500 mt-1 text-lg">Submit a new leave request for approval.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Apply Form - Spans 2 cols */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-soft border border-gray-100 h-fit relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading">Leave Request Form</h3>
                    <p className="text-slate-500 mb-8 text-sm">Fill in the details for your leave request</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-primary transition-colors">Leave Type <span className="text-rose-500">*</span></label>
                            <div className="relative">
                                <select name="leaveType" value={formData.leaveType} onChange={onChange} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all bg-white appearance-none cursor-pointer">
                                    <option value="SICK">Sick Leave</option>
                                    <option value="CASUAL">Casual Leave</option>
                                    <option value="EARNED">Earned Leave</option>
                                    <option value="LOSS_OF_PAY">Loss of Pay / Additional Leave</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-primary transition-colors">Start Date <span className="text-rose-500">*</span></label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={onChange} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-gray-700" required />
                            </div>
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-primary transition-colors">End Date <span className="text-rose-500">*</span></label>
                                <input type="date" name="endDate" value={formData.endDate} onChange={onChange} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-gray-700" required />
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-primary transition-colors">Reason <span className="text-rose-500">*</span></label>
                            <textarea name="reason" value={formData.reason} onChange={onChange} rows="4" className="w-full p-4 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none" placeholder="Please provide a reason for your leave request..."></textarea>
                        </div>


                        <div className="flex justify-end space-x-4 pt-4">
                            <button type="button" onClick={() => setFormData({ leaveType: 'SICK', startDate: '', endDate: '', reason: '' })} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-semibold transition-all duration-200">Clear Form</button>
                            <button type="submit" className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-1">Submit Request</button>
                        </div>
                    </form>
                </div>

                {/* Info Side - Spans 1 col */}
                <div className="space-y-6">
                    {/* Leave Balance */}
                    <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Clock size={80} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 font-heading">Leave Balance</h3>
                        <p className="text-slate-500 text-sm -mt-3 mb-6">Your remaining leaves for 2025</p>
                        <div className="space-y-4 relative z-10">
                            {leaveBalance.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                                    <span className="text-gray-600 font-medium">{item.type}</span>
                                    <span className="font-bold text-gray-900 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">{item.days}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Policy */}
                    <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

                        <div className="flex items-center space-x-3 mb-6 relative z-10">
                            <div className="bg-primary/10 p-2 rounded-lg"><Clock size={20} className="text-primary" /></div>
                            <h3 className="text-xl font-bold text-gray-900 font-heading">Leave Policy</h3>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Request Guidelines</h4>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start"><span className="mr-2 text-primary">•</span>Submit requests 2 days in advance</li>
                                    <li className="flex items-start"><span className="mr-2 text-primary">•</span>Medical certs for &gt;3 days sick leave</li>
                                    <li className="flex items-start"><span className="mr-2 text-primary">•</span>Max 3 consecutive casual leaves</li>
                                </ul>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Approval Process</h4>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start"><span className="mr-2 text-primary">•</span>Manager approval required</li>
                                    <li className="flex items-start"><span className="mr-2 text-primary">•</span>Email notification on status update</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leave;
