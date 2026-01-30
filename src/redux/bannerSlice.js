import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBannerApi, createBannerApi, updateBannerApi, deleteBannerApi } from '../api/BannerApi';

export const getBanner = createAsyncThunk('banner/getBanner', async (request) => {
    return await getBannerApi(request);
});

export const createBanner = createAsyncThunk('banner/createBanner', async (request) => {
    console.log('request');
    console.log(request);
    return await createBannerApi(request);
});

export const updateBanner = createAsyncThunk('banner/updateBanner', async ({ request, bannerId }) => {
    // Check if request is FormData or plain object
    if (request instanceof FormData) {
        return await updateBannerApi(request, bannerId);
    } else {
        // For simple status updates without files
        return await updateBannerApi(request, bannerId);
    }
});

export const deleteBanner = createAsyncThunk('banner/deleteBanner', async (bannerId) => {
    return await deleteBannerApi(bannerId);
});

const bannerSlice = createSlice({
    name: 'banner',
    initialState: {
        bannerData: [],
        loading: false,
        error: null,
        getBannerSuccess: false,
        getBannerFailed: false,
        createBannerSuccess: false,
        createBannerFailed: false,
        updateBannerSuccess: false,
        updateBannerFailed: false,
        deleteBannerSuccess: false,
        deleteBannerFailed: false,
    },
    reducers: {
        resetBannerStatus: (state) => {
            state.getBannerSuccess = false;
            state.getBannerFailed = false;
            state.createBannerSuccess = false;
            state.createBannerFailed = false;
            state.updateBannerSuccess = false;
            state.updateBannerFailed = false;
            state.deleteBannerSuccess = false;
            state.deleteBannerFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getBanner.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getBannerSuccess = false;
                state.getBannerFailed = false;
            })
            .addCase(getBanner.fulfilled, (state, action) => {
                state.loading = false;
                state.bannerData = action.payload.data || [];
                state.getBannerSuccess = true;
                state.getBannerFailed = false;
            })
            .addCase(getBanner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getBannerSuccess = false;
                state.getBannerFailed = true;
            })

            // CREATE
            .addCase(createBanner.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createBannerSuccess = false;
                state.createBannerFailed = false;
            })
            .addCase(createBanner.fulfilled, (state, action) => {
                state.loading = false;
                const newBanner = action.payload.data || action.payload;
                if (newBanner) {
                    // If we have single banner object, add it to array
                    if (!Array.isArray(newBanner)) {
                        state.bannerData.unshift(newBanner);
                    } else if (newBanner.length > 0) {
                        // If we have array, add the first one
                        state.bannerData.unshift(newBanner[0]);
                    }
                }
                state.createBannerSuccess = true;
                state.createBannerFailed = false;
            })
            .addCase(createBanner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createBannerSuccess = false;
                state.createBannerFailed = true;
            })

            // UPDATE
            .addCase(updateBanner.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateBannerSuccess = false;
                state.updateBannerFailed = false;
            })
            .addCase(updateBanner.fulfilled, (state, action) => {
                state.loading = false;
                const updatedBanner = action.payload.data || action.payload;
                if (updatedBanner && !Array.isArray(updatedBanner)) {
                    const index = state.bannerData.findIndex((banner) => banner.bannerId === updatedBanner.bannerId);
                    if (index !== -1) {
                        state.bannerData[index] = { ...state.bannerData[index], ...updatedBanner };
                    }
                } else if (updatedBanner && Array.isArray(updatedBanner) && updatedBanner.length > 0) {
                    const updatedSingle = updatedBanner[0];
                    const index = state.bannerData.findIndex((banner) => banner.bannerId === updatedSingle.bannerId);
                    if (index !== -1) {
                        state.bannerData[index] = { ...state.bannerData[index], ...updatedSingle };
                    }
                }
                state.updateBannerSuccess = true;
                state.updateBannerFailed = false;
            })
            .addCase(updateBanner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateBannerSuccess = false;
                state.updateBannerFailed = true;
            })

            // DELETE
            .addCase(deleteBanner.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteBannerSuccess = false;
                state.deleteBannerFailed = false;
            })
            .addCase(deleteBanner.fulfilled, (state, action) => {
                state.loading = false;
                const deletedId = action.meta.arg;
                state.bannerData = state.bannerData.filter((banner) => banner.bannerId !== deletedId);
                state.deleteBannerSuccess = true;
                state.deleteBannerFailed = false;
            })
            .addCase(deleteBanner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteBannerSuccess = false;
                state.deleteBannerFailed = true;
            });
    },
});

export const { resetBannerStatus } = bannerSlice.actions;
export default bannerSlice.reducer;
