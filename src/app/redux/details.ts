import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FetchSightingDetailsResponseType, SightingRecordType } from '../types';
import config from '../lib/client/config';
import { toast } from 'react-toastify';

export interface SightingDetailsState {
    id: string | undefined;
    loading: boolean;
    error: string | null;
    details: SightingRecordType
}

const detailsEndpoint = config.api.url as string + config.api.endpoints.details;

const initialState: SightingDetailsState = {
    id: undefined,
    loading: false,
    error: null,
    details: {}
};

export const fetchSightingDetails = createAsyncThunk<
    FetchSightingDetailsResponseType,
    string,
    { rejectValue: string | Error }
>(
    'sightingDetails/fetchSightingDetails',
    async (id: string, thunkAPI) => {
        try {
            const response = await fetch(`${detailsEndpoint}/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            return await response.json();
        }
        catch (error) {
            toast.error('Failed to fetch details. The database may be inaccessible.');
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

const detailsSlice = createSlice({
    name: 'sightingDetails',
    initialState,
    reducers: {
        setId: (state, action: PayloadAction<string | undefined>) => {
            state.id = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSightingDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSightingDetails.fulfilled, (state, action: PayloadAction<FetchSightingDetailsResponseType>) => {
                state.loading = false;
                state.details = action.payload.details;
            })
            .addCase(fetchSightingDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setId } = detailsSlice.actions;

export default detailsSlice.reducer;
