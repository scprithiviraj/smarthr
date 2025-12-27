import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from './dashboardService';

const initialState = {
    stats: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Get user stats
// Get user stats
export const getStats = createAsyncThunk('dashboard/getStats', async (_, thunkAPI) => {
    try {
        return await dashboardService.getUserStats();
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getStats.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.stats = action.payload;
            })
            .addCase(getStats.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = dashboardSlice.actions;
export default dashboardSlice.reducer;
