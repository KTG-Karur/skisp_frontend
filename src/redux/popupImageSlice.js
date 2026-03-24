import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPopupImageApi, createPopupImageApi, updatePopupImageApi, deletePopupImageApi } from '../api/PopupImageApi';

export const getPopupImage = createAsyncThunk('popupImage/getPopupImage', async (request) => {
    return await getPopupImageApi(request);
});

export const createPopupImage = createAsyncThunk('popupImage/createPopupImage', async (request) => {
    console.log('Creating popup image with request:', request);
    return await createPopupImageApi(request);
});

export const updatePopupImage = createAsyncThunk('popupImage/updatePopupImage', async ({ request, popupImageId }) => {
    if (request instanceof FormData) {
        return await updatePopupImageApi(request, popupImageId);
    } else {
        return await updatePopupImageApi(request, popupImageId);
    }
});

export const deletePopupImage = createAsyncThunk('popupImage/deletePopupImage', async (popupImageId) => {
    return await deletePopupImageApi(popupImageId);
});

const popupImageSlice = createSlice({
    name: 'popupImage',
    initialState: {
        popupImageData: [],
        loading: false,
        error: null,
        getPopupImageSuccess: false,
        getPopupImageFailed: false,
        createPopupImageSuccess: false,
        createPopupImageFailed: false,
        updatePopupImageSuccess: false,
        updatePopupImageFailed: false,
        deletePopupImageSuccess: false,
        deletePopupImageFailed: false,
    },
    reducers: {
        resetPopupImageStatus: (state) => {
            state.getPopupImageSuccess = false;
            state.getPopupImageFailed = false;
            state.createPopupImageSuccess = false;
            state.createPopupImageFailed = false;
            state.updatePopupImageSuccess = false;
            state.updatePopupImageFailed = false;
            state.deletePopupImageSuccess = false;
            state.deletePopupImageFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getPopupImage.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getPopupImageSuccess = false;
                state.getPopupImageFailed = false;
            })
            .addCase(getPopupImage.fulfilled, (state, action) => {
                state.loading = false;
                state.popupImageData = action.payload.data || [];
                state.getPopupImageSuccess = true;
                state.getPopupImageFailed = false;
            })
            .addCase(getPopupImage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getPopupImageSuccess = false;
                state.getPopupImageFailed = true;
            })

            // CREATE
            .addCase(createPopupImage.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createPopupImageSuccess = false;
                state.createPopupImageFailed = false;
            })
            .addCase(createPopupImage.fulfilled, (state, action) => {
                state.loading = false;
                const newPopupImage = action.payload.data || action.payload;
                if (newPopupImage) {
                    if (!Array.isArray(newPopupImage)) {
                        state.popupImageData.unshift(newPopupImage);
                    } else if (newPopupImage.length > 0) {
                        state.popupImageData.unshift(newPopupImage[0]);
                    }
                }
                state.createPopupImageSuccess = true;
                state.createPopupImageFailed = false;
            })
            .addCase(createPopupImage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createPopupImageSuccess = false;
                state.createPopupImageFailed = true;
            })

            // UPDATE
            .addCase(updatePopupImage.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updatePopupImageSuccess = false;
                state.updatePopupImageFailed = false;
            })
            .addCase(updatePopupImage.fulfilled, (state, action) => {
                state.loading = false;
                const updatedPopupImage = action.payload.data || action.payload;
                if (updatedPopupImage && !Array.isArray(updatedPopupImage)) {
                    const index = state.popupImageData.findIndex((popup) => popup.popupImageId === updatedPopupImage.popupImageId);
                    if (index !== -1) {
                        state.popupImageData[index] = { ...state.popupImageData[index], ...updatedPopupImage };
                    }
                } else if (updatedPopupImage && Array.isArray(updatedPopupImage) && updatedPopupImage.length > 0) {
                    const updatedSingle = updatedPopupImage[0];
                    const index = state.popupImageData.findIndex((popup) => popup.popupImageId === updatedSingle.popupImageId);
                    if (index !== -1) {
                        state.popupImageData[index] = { ...state.popupImageData[index], ...updatedSingle };
                    }
                }
                state.updatePopupImageSuccess = true;
                state.updatePopupImageFailed = false;
            })
            .addCase(updatePopupImage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updatePopupImageSuccess = false;
                state.updatePopupImageFailed = true;
            })

            // DELETE
            .addCase(deletePopupImage.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deletePopupImageSuccess = false;
                state.deletePopupImageFailed = false;
            })
            .addCase(deletePopupImage.fulfilled, (state, action) => {
                state.loading = false;
                const deletedId = action.meta.arg;
                state.popupImageData = state.popupImageData.filter((popup) => popup.popupImageId !== deletedId);
                state.deletePopupImageSuccess = true;
                state.deletePopupImageFailed = false;
            })
            .addCase(deletePopupImage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deletePopupImageSuccess = false;
                state.deletePopupImageFailed = true;
            });
    },
});

export const { resetPopupImageStatus } = popupImageSlice.actions;
export default popupImageSlice.reducer;