import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProductEnquiriesApi, createProductEnquiryApi, updateProductEnquiryApi, deleteProductEnquiryApi, getEnquiryStatisticsApi, deleteVisitorCardApi } from '../api/ProductEnquiryApi';

export const getProductEnquiries = createAsyncThunk('productEnquiry/getProductEnquiries', async (request) => {
    return await getProductEnquiriesApi(request);
});

export const createProductEnquiry = createAsyncThunk('productEnquiry/createProductEnquiry', async (request) => {
    return await createProductEnquiryApi(request);
});

export const updateProductEnquiry = createAsyncThunk('productEnquiry/updateProductEnquiry', async ({ request, enquiryId }) => {
    return await updateProductEnquiryApi(request, enquiryId);
});

export const deleteProductEnquiry = createAsyncThunk('productEnquiry/deleteProductEnquiry', async (enquiryId) => {
    return await deleteProductEnquiryApi(enquiryId);
});

export const getEnquiryStatistics = createAsyncThunk('productEnquiry/getEnquiryStatistics', async () => {
    return await getEnquiryStatisticsApi();
});

export const deleteVisitorCard = createAsyncThunk('productEnquiry/deleteVisitorCard', async ({ enquiryId, imageName }) => {
    return await deleteVisitorCardApi({ imageName }, enquiryId);
});

const productEnquirySlice = createSlice({
    name: 'productEnquiry',
    initialState: {
        enquiryData: [],
        statistics: {},
        loading: false,
        error: null,
        getEnquiriesSuccess: false,
        getEnquiriesFailed: false,
        createEnquirySuccess: false,
        createEnquiryFailed: false,
        updateEnquirySuccess: false,
        updateEnquiryFailed: false,
        deleteEnquirySuccess: false,
        deleteEnquiryFailed: false,
        getStatisticsSuccess: false,
        getStatisticsFailed: false,
        deleteVisitorCardSuccess: false,
        deleteVisitorCardFailed: false,
    },
    reducers: {
        resetProductEnquiryStatus: (state) => {
            state.getEnquiriesSuccess = false;
            state.getEnquiriesFailed = false;
            state.createEnquirySuccess = false;
            state.createEnquiryFailed = false;
            state.updateEnquirySuccess = false;
            state.updateEnquiryFailed = false;
            state.deleteEnquirySuccess = false;
            state.deleteEnquiryFailed = false;
            state.getStatisticsSuccess = false;
            state.getStatisticsFailed = false;
            state.deleteVisitorCardSuccess = false;
            state.deleteVisitorCardFailed = false;
            state.error = null;
            state.loading = false;
        },
        clearEnquiryData: (state) => {
            state.enquiryData = [];
        },
        addProductToForm: (state, action) => {
            // This can be used to manage form state locally if needed
        },
        removeProductFromForm: (state, action) => {
            // This can be used to manage form state locally if needed
        },
        // Local reducer to update visiting cards without API call
        updateEnquiryVisitingCards: (state, action) => {
            const { enquiryId, visitingCards } = action.payload;
            const enquiry = state.enquiryData.find(e => e.enquiryId === enquiryId);
            if (enquiry) {
                enquiry.visitingCard = visitingCards;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // GET ENQUIRIES
            .addCase(getProductEnquiries.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getEnquiriesSuccess = false;
                state.getEnquiriesFailed = false;
            })
            .addCase(getProductEnquiries.fulfilled, (state, action) => {
                state.loading = false;
                state.enquiryData = action.payload.data || [];
                state.getEnquiriesSuccess = true;
                state.getEnquiriesFailed = false;
            })
            .addCase(getProductEnquiries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch enquiries';
                state.getEnquiriesSuccess = false;
                state.getEnquiriesFailed = true;
            })

            // CREATE ENQUIRY
            .addCase(createProductEnquiry.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createEnquirySuccess = false;
                state.createEnquiryFailed = false;
            })
            .addCase(createProductEnquiry.fulfilled, (state, action) => {
                state.loading = false;
                const newEnquiry = action.payload.data ? action.payload.data[0] : action.payload;
                if (newEnquiry) {
                    state.enquiryData.unshift(newEnquiry);
                }
                state.createEnquirySuccess = true;
                state.createEnquiryFailed = false;
            })
            .addCase(createProductEnquiry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create enquiry';
                state.createEnquirySuccess = false;
                state.createEnquiryFailed = true;
            })

            // UPDATE ENQUIRY
            .addCase(updateProductEnquiry.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateEnquirySuccess = false;
                state.updateEnquiryFailed = false;
            })
            .addCase(updateProductEnquiry.fulfilled, (state, action) => {
                state.loading = false;
                const updatedEnquiry = action.payload.data ? action.payload.data[0] : action.payload;
                if (updatedEnquiry) {
                    const index = state.enquiryData.findIndex((enquiry) => enquiry.enquiryId === updatedEnquiry.enquiryId);
                    if (index !== -1) {
                        state.enquiryData[index] = updatedEnquiry;
                    }
                }
                state.updateEnquirySuccess = true;
                state.updateEnquiryFailed = false;
            })
            .addCase(updateProductEnquiry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update enquiry';
                state.updateEnquirySuccess = false;
                state.updateEnquiryFailed = true;
            })

            // DELETE ENQUIRY
            .addCase(deleteProductEnquiry.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteEnquirySuccess = false;
                state.deleteEnquiryFailed = false;
            })
            .addCase(deleteProductEnquiry.fulfilled, (state, action) => {
                state.loading = false;
                const deletedId = action.meta.arg;
                state.enquiryData = state.enquiryData.filter((enquiry) => enquiry.enquiryId !== deletedId);
                state.deleteEnquirySuccess = true;
                state.deleteEnquiryFailed = false;
            })
            .addCase(deleteProductEnquiry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete enquiry';
                state.deleteEnquirySuccess = false;
                state.deleteEnquiryFailed = true;
            })

            // GET STATISTICS
            .addCase(getEnquiryStatistics.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getStatisticsSuccess = false;
                state.getStatisticsFailed = false;
            })
            .addCase(getEnquiryStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.statistics = action.payload.data || {};
                state.getStatisticsSuccess = true;
                state.getStatisticsFailed = false;
            })
            .addCase(getEnquiryStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch statistics';
                state.getStatisticsSuccess = false;
                state.getStatisticsFailed = true;
            })

            // DELETE VISITOR CARD
            .addCase(deleteVisitorCard.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteVisitorCardSuccess = false;
                state.deleteVisitorCardFailed = false;
            })
            .addCase(deleteVisitorCard.fulfilled, (state, action) => {
                state.loading = false;
                const { enquiryId, remainingImages } = action.payload.data;
                const enquiryIndex = state.enquiryData.findIndex((enquiry) => enquiry.enquiryId === enquiryId);
                if (enquiryIndex !== -1) {
                    state.enquiryData[enquiryIndex].visitingCard = JSON.stringify(remainingImages);
                }
                state.deleteVisitorCardSuccess = true;
                state.deleteVisitorCardFailed = false;
            })
            .addCase(deleteVisitorCard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete visitor card';
                state.deleteVisitorCardSuccess = false;
                state.deleteVisitorCardFailed = true;
            });
    },
});

export const { 
    resetProductEnquiryStatus, 
    clearEnquiryData, 
    addProductToForm, 
    removeProductFromForm,
    updateEnquiryVisitingCards 
} = productEnquirySlice.actions;

export default productEnquirySlice.reducer;