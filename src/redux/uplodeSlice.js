import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createUpload } from '../api/UploadApi';

export const createUplode = createAsyncThunk('role/createUplode', async ({ request, id }) => {
    return await createUpload(request, id);
});

const uplodeSlice = createSlice({
    name: 'uplode',
    initialState: {
        uplodes: [],
        loading: false,
        error: null,
        createUplodeSuccess: false,
        createUplodeFailed: false,
    },
    reducers: {
        resetUplodeStatus: (state) => {
            state.createUplodeSuccess = false;
            state.createUplodeFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // CREATE GROUP
            .addCase(createUplode.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createUplodeSuccess = false;
                state.createUplodeFailed = false;
            })
            .addCase(createUplode.fulfilled, (state, action) => {
                state.loading = false;
                state.uplodes.push(action.payload);
                state.currentUplode = action.payload;
                state.createUplodeSuccess = true;
            })
            .addCase(createUplode.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create uplode';
                state.createUplodeSuccess = false;
                state.createUplodeFailed = true;
            })
    },
});

export const { resetUplodeStatus } = uplodeSlice.actions;
export default uplodeSlice.reducer;
