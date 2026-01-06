import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getClientApi, createClientApi, updateClientApi, deleteClientApi } from '../api/ClientApi';

export const getClient = createAsyncThunk('client/getClient', async (request) => {
    return await getClientApi(request);
});

export const createClient = createAsyncThunk('client/createClient', async (request) => {
    return await createClientApi(request);
});

export const updateClient = createAsyncThunk('client/updateClient', async ({ request, clientId }) => {
    return await updateClientApi(request, clientId);
});

export const deleteClient = createAsyncThunk('client/deleteClient', async (clientId) => {
    return await deleteClientApi(clientId);
});

const clientSlice = createSlice({
    name: 'client',
    initialState: {
        clientData: [],
        loading: false,
        error: null,
        getClientSuccess: false,
        getClientFailed: false,
        createClientSuccess: false,
        createClientFailed: false,
        updateClientSuccess: false,
        updateClientFailed: false,
        deleteClientSuccess: false,
        deleteClientFailed: false,
    },
    reducers: {
        resetClientStatus: (state) => {
            state.getClientSuccess = false;
            state.getClientFailed = false;
            state.createClientSuccess = false;
            state.createClientFailed = false;
            state.updateClientSuccess = false;
            state.updateClientFailed = false;
            state.deleteClientSuccess = false;
            state.deleteClientFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getClient.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getClientSuccess = false;
                state.getClientFailed = false;
            })
            .addCase(getClient.fulfilled, (state, action) => {
                state.loading = false;
                // Map API response to match our component structure
                state.clientData = action.payload.data.map((dept) => ({
                    id: dept.clientId, // Map clientId to id
                    clientName: dept.clientName,
                    status: dept.isActive === 1 ? 'Active' : 'Inactive', // Map isActive to status
                    isActive: dept.isActive,
                    createdAt: dept.createdAt,
                    updatedAt: dept.updatedAt,
                }));
                state.getClientSuccess = true;
                state.getClientFailed = false;
            })
            .addCase(getClient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getClientSuccess = false;
                state.getClientFailed = true;
            })
            // CREATE
            .addCase(createClient.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createClientSuccess = false;
                state.createClientFailed = false;
            })
            .addCase(createClient.fulfilled, (state, action) => {
                state.loading = false;
                const newClient = action.payload.data || action.payload;
                // Map the new client to match our structure
                state.clientData.push({
                    id: newClient.clientId,
                    clientName: newClient.clientName,
                    status: newClient.isActive === 1 ? 'Active' : 'Inactive',
                    isActive: newClient.isActive,
                    createdAt: newClient.createdAt,
                    updatedAt: newClient.updatedAt,
                });
                state.createClientSuccess = true;
                state.createClientFailed = false;
            })
            .addCase(createClient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createClientSuccess = false;
                state.createClientFailed = true;
            })
            // UPDATE
            .addCase(updateClient.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateClientSuccess = false;
                state.updateClientFailed = false;
            })
            .addCase(updateClient.fulfilled, (state, action) => {
                state.loading = false;
                const updatedClient = action.payload.data || action.payload;
                const index = state.clientData.findIndex((client) => client.id === updatedClient.clientId);
                if (index !== -1) {
                    state.clientData[index] = {
                        id: updatedClient.clientId,
                        clientName: updatedClient.clientName,
                        status: updatedClient.isActive === 1 ? 'Active' : 'Inactive',
                        isActive: updatedClient.isActive,
                        createdAt: updatedClient.createdAt,
                        updatedAt: updatedClient.updatedAt,
                    };
                }
                state.updateClientSuccess = true;
                state.updateClientFailed = false;
            })
            .addCase(updateClient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateClientSuccess = false;
                state.updateClientFailed = true;
            })
            // DELETE
            .addCase(deleteClient.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteClientSuccess = false;
                state.deleteClientFailed = false;
            })
            .addCase(deleteClient.fulfilled, (state, action) => {
                state.loading = false;
                // Use the clientId that was passed to the thunk
                const deletedId = action.meta.arg;
                state.clientData = state.clientData.filter((client) => client.id !== deletedId);
                state.deleteClientSuccess = true;
                state.deleteClientFailed = false;
            })
            .addCase(deleteClient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteClientSuccess = false;
                state.deleteClientFailed = true;
            });
    },
});

export const { resetClientStatus } = clientSlice.actions;
export default clientSlice.reducer;
