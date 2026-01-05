import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const initialState = {
    history: [],
    isLoading: false,
    isError: false,
    message: '',
};

export const checkIn = createAsyncThunk('attendance/checkIn', async (_, thunkAPI) => {
    try {
        const response = await api.post('/attendance/check-in');
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
    }
});

export const checkOut = createAsyncThunk('attendance/checkOut', async (_, thunkAPI) => {
    try {
        const response = await api.post('/attendance/check-out');
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
    }
});

export const getHistory = createAsyncThunk('attendance/getHistory', async (_, thunkAPI) => {
    try {
        const response = await api.get('/attendance/my-history');
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
    }
});

export const requestLatePunchIn = createAsyncThunk('attendance/requestLatePunchIn', async (reason, thunkAPI) => {
    try {
        const response = await api.post('/attendance/late-request', { reason });
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
    }
});

export const getMyLateRequest = createAsyncThunk('attendance/getMyLateRequest', async (_, thunkAPI) => {
    try {
        const response = await api.get('/attendance/late-request/my-status');
        return response.data;
    } catch (error) {
        // 404 means no request; handle gracefully if needed or just return null
        return thunkAPI.rejectWithValue(error.response.data);
    }
});

export const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkIn.fulfilled, (state, action) => {
                state.history.push(action.payload);
            })
            .addCase(checkOut.fulfilled, (state, action) => {
                // Update the specific record in history (simplified)
                const index = state.history.findIndex(x => x.id === action.payload.id);
                if (index !== -1) state.history[index] = action.payload;
            })
            .addCase(getHistory.fulfilled, (state, action) => {
                state.history = action.payload;
            });
    },
});

export const { reset } = attendanceSlice.actions;
export default attendanceSlice.reducer;
