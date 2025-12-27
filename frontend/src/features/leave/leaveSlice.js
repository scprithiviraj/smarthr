import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const initialState = {
    leaves: [],
    isLoading: false,
    isError: false,
    message: '',
};

export const applyLeave = createAsyncThunk('leave/apply', async (leaveData, thunkAPI) => {
    try {
        const response = await api.post('/leaves/apply', leaveData);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
    }
});

export const getMyLeaves = createAsyncThunk('leave/getMyLeaves', async (_, thunkAPI) => {
    try {
        const response = await api.get('/leaves/my-leaves');
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
    }
});


export const getAllLeaves = createAsyncThunk('leave/getAllLeaves', async (_, thunkAPI) => {
    try {
        const response = await api.get('/leaves/all');
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const approveLeave = createAsyncThunk('leave/approveLeave', async (id, thunkAPI) => {
    try {
        const response = await api.put(`/leaves/${id}/approve`);
        return { id, status: 'APPROVED', data: response.data };
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const rejectLeave = createAsyncThunk('leave/rejectLeave', async (id, thunkAPI) => {
    try {
        const response = await api.put(`/leaves/${id}/reject`);
        return { id, status: 'REJECTED', data: response.data };
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const leaveSlice = createSlice({
    name: 'leave',
    initialState,
    reducers: {
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Apply Leave
            .addCase(applyLeave.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(applyLeave.fulfilled, (state, action) => {
                state.isLoading = false;
                state.leaves.push(action.payload);
            })
            .addCase(applyLeave.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload || action.error.message;
            })

            // Get My Leaves
            .addCase(getMyLeaves.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(getMyLeaves.fulfilled, (state, action) => {
                state.isLoading = false;
                state.leaves = action.payload;
            })
            .addCase(getMyLeaves.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload || action.error.message;
            })

            // Get All Leaves (Admin)
            .addCase(getAllLeaves.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(getAllLeaves.fulfilled, (state, action) => {
                state.isLoading = false;
                state.leaves = action.payload;
            })
            .addCase(getAllLeaves.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload || action.error.message;
            })

            // Approve / Reject
            .addCase(approveLeave.fulfilled, (state, action) => {
                const index = state.leaves.findIndex(leave => leave.id === action.payload.id);
                if (index !== -1) {
                    state.leaves[index].status = 'APPROVED';
                }
            })
            .addCase(approveLeave.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload || action.error.message;
            })
            .addCase(rejectLeave.fulfilled, (state, action) => {
                const index = state.leaves.findIndex(leave => leave.id === action.payload.id);
                if (index !== -1) {
                    state.leaves[index].status = 'REJECTED';
                }
            })
            .addCase(rejectLeave.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload || action.error.message;
            });
    },
});

export const { reset } = leaveSlice.actions;
export default leaveSlice.reducer;
