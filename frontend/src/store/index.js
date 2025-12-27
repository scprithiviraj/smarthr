import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';
import leaveReducer from '../features/leave/leaveSlice';
import employeeReducer from '../features/employee/employeeSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        attendance: attendanceReducer,
        leave: leaveReducer,
        employee: employeeReducer,
        dashboard: dashboardReducer,
    },
});
