import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProviderApi, createProviderApi, updateProviderApi, deleteProviderApi } from '../api/ProviderApi';

export const getProvider = createAsyncThunk('provider/getProvider', async (request) => {
    return await getProviderApi(request);
});

export const createProvider = createAsyncThunk('provider/createProvider', async (request) => {
    return await createProviderApi(request);
});

export const updateProvider = createAsyncThunk('provider/updateProvider', async ({ request, providerId }) => {
    return await updateProviderApi(request, providerId);
});

export const deleteProvider = createAsyncThunk('provider/deleteProvider', async (providerId) => {
    return await deleteProviderApi(providerId);
});

const providerSlice = createSlice({
    name: 'provider',
    initialState: {
        providerData: [],
        loading: false,
        error: null,
        getProviderSuccess: false,
        getProviderFailed: false,
        createProviderSuccess: false,
        createProviderFailed: false,
        updateProviderSuccess: false,
        updateProviderFailed: false,
        deleteProviderSuccess: false,
        deleteProviderFailed: false,
    },
    reducers: {
        resetProviderStatus: (state) => {
            state.getProviderSuccess = false;
            state.getProviderFailed = false;
            state.createProviderSuccess = false;
            state.createProviderFailed = false;
            state.updateProviderSuccess = false;
            state.updateProviderFailed = false;
            state.deleteProviderSuccess = false;
            state.deleteProviderFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getProvider.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getProviderSuccess = false;
                state.getProviderFailed = false;
            })
            .addCase(getProvider.fulfilled, (state, action) => {
                state.loading = false;
                // Map API response to match our component structure
                state.providerData = action.payload.data.map((dept) => ({
                    id: dept.providerId, // Map providerId to id
                    providerName: dept.providerName,
                    status: dept.isActive === 1 ? 'Active' : 'Inactive', // Map isActive to status
                    isActive: dept.isActive,
                    createdAt: dept.createdAt,
                    updatedAt: dept.updatedAt,
                }));
                state.getProviderSuccess = true;
                state.getProviderFailed = false;
            })
            .addCase(getProvider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getProviderSuccess = false;
                state.getProviderFailed = true;
            })
            // CREATE
            .addCase(createProvider.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createProviderSuccess = false;
                state.createProviderFailed = false;
            })
            .addCase(createProvider.fulfilled, (state, action) => {
                state.loading = false;
                const newProvider = action.payload.data || action.payload;
                // Map the new provider to match our structure
                state.providerData.push({
                    id: newProvider.providerId,
                    providerName: newProvider.providerName,
                    status: newProvider.isActive === 1 ? 'Active' : 'Inactive',
                    isActive: newProvider.isActive,
                    createdAt: newProvider.createdAt,
                    updatedAt: newProvider.updatedAt,
                });
                state.createProviderSuccess = true;
                state.createProviderFailed = false;
            })
            .addCase(createProvider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createProviderSuccess = false;
                state.createProviderFailed = true;
            })
            // UPDATE
            .addCase(updateProvider.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateProviderSuccess = false;
                state.updateProviderFailed = false;
            })
            .addCase(updateProvider.fulfilled, (state, action) => {
                state.loading = false;
                const updatedProvider = action.payload.data || action.payload;
                const index = state.providerData.findIndex((provider) => provider.id === updatedProvider.providerId);
                if (index !== -1) {
                    state.providerData[index] = {
                        id: updatedProvider.providerId,
                        providerName: updatedProvider.providerName,
                        status: updatedProvider.isActive === 1 ? 'Active' : 'Inactive',
                        isActive: updatedProvider.isActive,
                        createdAt: updatedProvider.createdAt,
                        updatedAt: updatedProvider.updatedAt,
                    };
                }
                state.updateProviderSuccess = true;
                state.updateProviderFailed = false;
            })
            .addCase(updateProvider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateProviderSuccess = false;
                state.updateProviderFailed = true;
            })
            // DELETE
            .addCase(deleteProvider.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteProviderSuccess = false;
                state.deleteProviderFailed = false;
            })
            .addCase(deleteProvider.fulfilled, (state, action) => {
                state.loading = false;
                // Use the providerId that was passed to the thunk
                const deletedId = action.meta.arg;
                state.providerData = state.providerData.filter((provider) => provider.id !== deletedId);
                state.deleteProviderSuccess = true;
                state.deleteProviderFailed = false;
            })
            .addCase(deleteProvider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteProviderSuccess = false;
                state.deleteProviderFailed = true;
            });
    },
});

export const { resetProviderStatus } = providerSlice.actions;
export default providerSlice.reducer;
