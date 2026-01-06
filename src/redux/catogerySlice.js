import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCategoryApi, createCategoryApi, updateCategoryApi, deleteCategoryApi } from '../api/CategoryApi';

export const getCategory = createAsyncThunk('category/getCategory', async (request) => {
    return await getCategoryApi(request);
});

export const createCategory = createAsyncThunk('category/createCategory', async (request) => {
    return await createCategoryApi(request);
});

export const updateCategory = createAsyncThunk('category/updateCategory', async ({ request, categoryId }) => {
    return await updateCategoryApi(request, categoryId);
});

export const deleteCategory = createAsyncThunk('category/deleteCategory', async (categoryId) => {
    return await deleteCategoryApi(categoryId);
});

const categorySlice = createSlice({
    name: 'category',
    initialState: {
        categoryData: [],
        loading: false,
        error: null,
        getCategorySuccess: false,
        getCategoryFailed: false,
        createCategorySuccess: false,
        createCategoryFailed: false,
        updateCategorySuccess: false,
        updateCategoryFailed: false,
        deleteCategorySuccess: false,
        deleteCategoryFailed: false,
    },
    reducers: {
        resetCategoryStatus: (state) => {
            state.getCategorySuccess = false;
            state.getCategoryFailed = false;
            state.createCategorySuccess = false;
            state.createCategoryFailed = false;
            state.updateCategorySuccess = false;
            state.updateCategoryFailed = false;
            state.deleteCategorySuccess = false;
            state.deleteCategoryFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getCategorySuccess = false;
                state.getCategoryFailed = false;
            })
            .addCase(getCategory.fulfilled, (state, action) => {
                state.loading = false;
                // Map API response to match our component structure
                state.categoryData = action.payload.data.map((dept) => ({
                    id: dept.categoryId, // Map categoryId to id
                    categoryName: dept.categoryName,
                    status: dept.isActive === 1 ? 'Active' : 'Inactive', // Map isActive to status
                    isActive: dept.isActive,
                    createdAt: dept.createdAt,
                    updatedAt: dept.updatedAt,
                }));
                state.getCategorySuccess = true;
                state.getCategoryFailed = false;
            })
            .addCase(getCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getCategorySuccess = false;
                state.getCategoryFailed = true;
            })
            // CREATE
            .addCase(createCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createCategorySuccess = false;
                state.createCategoryFailed = false;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.loading = false;
                const newCategory = action.payload.data || action.payload;
                // Map the new category to match our structure
                state.categoryData.push({
                    id: newCategory.categoryId,
                    categoryName: newCategory.categoryName,
                    status: newCategory.isActive === 1 ? 'Active' : 'Inactive',
                    isActive: newCategory.isActive,
                    createdAt: newCategory.createdAt,
                    updatedAt: newCategory.updatedAt,
                });
                state.createCategorySuccess = true;
                state.createCategoryFailed = false;
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createCategorySuccess = false;
                state.createCategoryFailed = true;
            })
            // UPDATE
            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateCategorySuccess = false;
                state.updateCategoryFailed = false;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false;
                const updatedCategory = action.payload.data || action.payload;
                const index = state.categoryData.findIndex((category) => category.id === updatedCategory.categoryId);
                if (index !== -1) {
                    state.categoryData[index] = {
                        id: updatedCategory.categoryId,
                        categoryName: updatedCategory.categoryName,
                        status: updatedCategory.isActive === 1 ? 'Active' : 'Inactive',
                        isActive: updatedCategory.isActive,
                        createdAt: updatedCategory.createdAt,
                        updatedAt: updatedCategory.updatedAt,
                    };
                }
                state.updateCategorySuccess = true;
                state.updateCategoryFailed = false;
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateCategorySuccess = false;
                state.updateCategoryFailed = true;
            })
            // DELETE
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteCategorySuccess = false;
                state.deleteCategoryFailed = false;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loading = false;
                // Use the categoryId that was passed to the thunk
                const deletedId = action.meta.arg;
                state.categoryData = state.categoryData.filter((category) => category.id !== deletedId);
                state.deleteCategorySuccess = true;
                state.deleteCategoryFailed = false;
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteCategorySuccess = false;
                state.deleteCategoryFailed = true;
            });
    },
});

export const { resetCategoryStatus } = categorySlice.actions;
export default categorySlice.reducer;
