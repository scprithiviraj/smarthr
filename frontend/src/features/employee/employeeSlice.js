import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const initialState = {
    employees: [],
    isLoading: false,
    isError: false,
    message: '',
};

export const getAllEmployees = createAsyncThunk('employee/getAll', async (_, thunkAPI) => {
    try {
        const response = await api.get('/users');
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
    }
});

export const employeeSlice = createSlice({
    name: 'employee',
    initialState,
    reducers: {
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllEmployees.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllEmployees.fulfilled, (state, action) => {
                state.isLoading = false;
                state.employees = action.payload;
            })
            .addCase(getAllEmployees.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = employeeSlice.actions;
export default employeeSlice.reducer;
