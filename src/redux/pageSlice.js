import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPagesApi, createPageApi, updatePageApi } from '../api/PageApi';

export const getPages = createAsyncThunk('pages/getPages', async (request = {}) => {
    const data = await getPagesApi(request);
    return data;
});

export const createPage = createAsyncThunk('pages/createPage', async (request) => {
    return await createPageApi(request);
});

export const updatePage = createAsyncThunk('pages/updatePage', async ({ request, pageId }) => {
    return await updatePageApi(request, pageId);
});

const pageSlice = createSlice({
    name: 'page',
    initialState: {
        pagesData: [],
        getPageList: [],
        loading: false,
        error: null,
        getPagesSuccess: false,
        getPagesFailed: false,
        getPageSuccess: false,
        getPageFailure: false,
        createPageSuccess: false,
        createPageFailed: false,
        updatePageSuccess: false,
        updatePageFailed: false,
        errorMessage: null,
    },
    reducers: {
        resetPageStatus: (state) => {
            state.getPagesSuccess = false;
            state.getPagesFailed = false;
            state.getPageSuccess = false;
            state.getPageFailure = false;
            state.createPageSuccess = false;
            state.createPageFailed = false;
            state.updatePageSuccess = false;
            state.updatePageFailed = false;
            state.error = null;
            state.errorMessage = null;
            state.loading = false;
        },
        setPagesData: (state, action) => {
            state.pagesData = action.payload;
            state.getPageList = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH PAGES
            .addCase(getPages.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.getPagesSuccess = false;
                state.getPagesFailed = false;
                state.getPageSuccess = false;
                state.getPageFailure = false;
            })
            .addCase(getPages.fulfilled, (state, action) => {
                state.loading = false;
                state.pagesData = action.payload.data || [];
                state.getPageList = action.payload.data || [];
                state.getPagesSuccess = true;
                state.getPageSuccess = true;
                state.getPagesFailed = false;
                state.getPageFailure = false;
            })
            .addCase(getPages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch pages failed';
                state.errorMessage = action.error.message || 'Fetch pages failed';
                state.getPagesSuccess = false;
                state.getPageSuccess = false;
                state.getPagesFailed = true;
                state.getPageFailure = true;
            })

            // CREATE PAGE
            .addCase(createPage.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.createPageSuccess = false;
                state.createPageFailed = false;
            })
            .addCase(createPage.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data) {
                    state.pagesData.push(action.payload.data);
                    state.getPageList.push(action.payload.data);
                }
                state.createPageSuccess = true;
                state.createPageFailed = false;
            })
            .addCase(createPage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create page failed';
                state.errorMessage = action.error.message || 'Create page failed';
                state.createPageSuccess = false;
                state.createPageFailed = true;
            })

            // UPDATE PAGE
            .addCase(updatePage.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.updatePageSuccess = false;
                state.updatePageFailed = false;
            })
            .addCase(updatePage.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data) {
                    const index = state.pagesData.findIndex((page) => page.pageId === action.payload.data.pageId);
                    if (index !== -1) {
                        state.pagesData[index] = action.payload.data;
                        state.getPageList[index] = action.payload.data;
                    }
                }
                state.updatePageSuccess = true;
                state.updatePageFailed = false;
            })
            .addCase(updatePage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update page failed';
                state.errorMessage = action.error.message || 'Update page failed';
                state.updatePageSuccess = false;
                state.updatePageFailed = true;
            });
    },
});

export const { resetPageStatus, setPagesData } = pageSlice.actions;
export default pageSlice.reducer;
