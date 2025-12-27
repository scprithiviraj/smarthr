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

    const [file, setFile] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        const leaveRequest = {
            leaveType: formData.leaveType,
            startDate: formData.startDate,
            endDate: formData.endDate,
            reason: formData.reason
        };
        data.append('leaveRequest', new Blob([JSON.stringify(leaveRequest)], { type: 'application/json' }));
        if (file) {
            data.append('file', file);
        }
        dispatch(applyLeave(data)).then(() => {
            alert("Leave application submitted!"); // Feedback
            setFormData({ leaveType: 'SICK', startDate: '', endDate: '', reason: '' });
            setFile(null);
        });
    };

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onFileChange = (e) => setFile(e.target.files[0]);

    // Data for right side
    const leaveBalance = [
        { type: 'Casual Leave', days: '7 days' },
        { type: 'Sick Leave', days: '5 days' },
        { type: 'Earned Leave', days: '12 days' },
        { type: 'Maternity Leave', days: '90 days' },
        { type: 'Paternity Leave', days: '15 days' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Apply Leave</h1>
                <p className="text-gray-500 mt-1">Submit a new leave request for approval.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Apply Form - Spans 2 cols */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Leave Request Form</h3>
                    <p className="text-gray-500 -mt-5 mb-8 text-sm">Fill in the details for your leave request</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Leave Type *</label>
                            <select name="leaveType" value={formData.leaveType} onChange={onChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition bg-white">
                                <option value="SICK">Sick Leave</option>
                                <option value="CASUAL">Casual Leave</option>
                                <option value="EARNED">Earned Leave</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={onChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-gray-600" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
                                <input type="date" name="endDate" value={formData.endDate} onChange={onChange} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-gray-600" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Reason *</label>
                            <textarea name="reason" value={formData.reason} onChange={onChange} rows="4" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition" placeholder="Please provide a reason for your leave request..."></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Supporting Document (Optional)</label>
                            <div className="flex items-center space-x-2">
                                <label className="flex-1 cursor-pointer">
                                    <div className="w-full p-3 border border-gray-200 border-dashed rounded-lg text-gray-500 hover:bg-gray-50 transition flex items-center justify-between">
                                        <span>{file ? file.name : 'Choose File'}</span>
                                        <span className="bg-gray-100 p-1 rounded text-xs">Upload</span>
                                    </div>
                                    <input type="file" onChange={onFileChange} className="hidden" />
                                </label>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)</p>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <button type="button" onClick={() => setFormData({ leaveType: 'SICK', startDate: '', endDate: '', reason: '' })} className="px-6 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold transition">Clear</button>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-lg transition shadow-md shadow-blue-200">Submit Request</button>
                        </div>
                    </form>
                </div>

                {/* Info Side - Spans 1 col */}
                <div className="space-y-6">
                    {/* Leave Balance */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Leave Balance</h3>
                        <p className="text-gray-500 text-sm -mt-3 mb-6">Your remaining leaves for 2025</p>
                        <div className="space-y-4">
                            {leaveBalance.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">{item.type}</span>
                                    <span className="font-semibold text-gray-800">{item.days}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Policy */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="text-blue-600"><Clock size={16} /></div>
                            {/* The icon in image is an info circle 'i' */}
                            <h3 className="text-lg font-bold text-gray-800">Leave Policy</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 mb-2">Request Guidelines</h4>
                                <ul className="list-disc list-inside text-xs text-gray-500 space-y-1 ml-1">
                                    <li>Submit requests at least 2 days in advance</li>
                                    <li>Medical certificates required for sick leave exceeding 3 days</li>
                                    <li>Maximum 3 consecutive casual leaves</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 mb-2">Approval Process</h4>
                                <ul className="list-disc list-inside text-xs text-gray-500 space-y-1 ml-1">
                                    <li>Requests reviewed within 24 hours</li>
                                    <li>Manager approval required</li>
                                    <li>Email notification on status update</li>
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
