import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { admin_apiEndpoint, config_variable, domain } from '../../helper/commonApi';
import axios from 'axios';
import { ApiCall } from '../../helper/axios';

export const generateToken = createAsyncThunk('fetch/generateToken', async () => {
    const res = await ApiCall('POST', '/generate-token', { shop: config_variable.shop_name })
    if (res.data.status === 'success' && res.data.statusCode === 200) {
        return res?.data?.data;
    } else {
        if (window.location.hostname !== 'localhost') {
            window.parent.location.href = `${admin_apiEndpoint}?shop=${config_variable.shop_name}&host=${config_variable?.config.host}`;
        }
    }
});


const commonSlice = createSlice({
    name: 'common',
    initialState: {
        store_data: {},
        status: false,
        isError: false
    },
    extraReducers: (builder) => {
        builder
            .addCase(generateToken.pending, (state) => {
                state.status = false;
            })
            .addCase(generateToken.fulfilled, (state, { payload }) => {
                if (payload) {
                    const { shop_data, token } = payload;
                    state.store_data = { shop_data, token };
                    state.status = true;
                }
            })
            .addCase(generateToken.rejected, (state) => {
                state.isError = false;
                if (window.location.hostname !== 'localhost') {
                    window.parent.location.href = `${admin_apiEndpoint}?shop=${config_variable.shop_name}&host=${config_variable?.config.host}`;
                }
            });
    },
    reducers: {
        commonSliceData: (state, action) => {
            state.store_data = action.payload;
        }
    },
});
export const { updateSliceData } = commonSlice.actions;
export default commonSlice.reducer;
