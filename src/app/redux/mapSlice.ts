// redux/mapSlice
/**
 * Stores various map parameters that the user can change
 * and/or that we wish to store and/or restore.
 * 
 * Center could be inferred from bounds, but for now is set.
 */

import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import config from '../lib/client/config';
import { FeatureSourceAttributeType, MapDictionaryType, UfoFeatureCollectionType, SearchResposneType } from '../types';
import type { MapBaseLayerKeyType } from '../components/Map';
import { downloadCsvBlob } from '../lib/client/download-csv-blob';
import { AppDispatch, RootState } from './store';

export interface MapState {
  center: [number, number];
  zoom: number;
  bounds: [number, number, number, number] | null;
  featureCollection?: UfoFeatureCollectionType;
  dictionary?: MapDictionaryType;
  from_date?: number;
  to_date?: number;
  q?: string;
  basemapSource: string;
  previousQueryString: string;
  queryString: string;
  requestingCsv: boolean;
  requestingFeatures: boolean;
  source: FeatureSourceAttributeType;
}

const searchEndpoint = config.api.url + config.api.endpoints.search;

const initialState: MapState = {
  featureCollection: undefined,
  zoom: 5,
  center: config.gui.map.centre,
  bounds: null,
  dictionary: undefined,
  from_date: undefined,
  to_date: undefined,
  q: '',
  basemapSource: 'geo', // localStorage.getItem('basemap_source') ?? 'geo',
  previousQueryString: '',
  queryString: '',
  requestingFeatures: false,
  requestingCsv: false,
  source: 'not-specified',
};

const setQueryString = (state: MapState) => {
  const { zoom, bounds, from_date, to_date, q, source } = state;

  if (!zoom || !bounds) {
    console.warn('setQueryString: no bounds or zoom');
  }

  const queryObject = {
    zoom: String(zoom),
    minlng: String(bounds[0]),
    minlat: String(bounds[1]),
    maxlng: String(bounds[2]),
    maxlat: String(bounds[3]),
    source: String(source),
    ...(from_date !== undefined ? { from_date: String(from_date) } : {}),
    ...(to_date !== undefined ? { to_date: String(to_date) } : {}),
    ...(q !== '' ? { q: q } : {}),
  };
  const returnedQueryString = new URLSearchParams(queryObject).toString();

  return {
    previousQueryString: state.previousQueryString,
    queryString: returnedQueryString,
  };
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setMapParams(state, action: PayloadAction<{ center: [number, number]; zoom: number; bounds: [number, number, number, number] }>) {
      state.center = action.payload.center;
      state.zoom = action.payload.zoom;
      state.bounds = action.payload.bounds;
    },
    setFeatureCollection(state, action: PayloadAction<SearchResposneType>) {
      state.dictionary = action.payload.dictionary;
      state.featureCollection = action.payload.results;
      if ((state.featureCollection as UfoFeatureCollectionType).features === null) {
        state.featureCollection.features = [];
      }
    },
    resetDates(state) {
      state.from_date = undefined;
      state.to_date = undefined;
      console.log('reset dates')
    },
    setFromDate(state, action: PayloadAction<number | undefined>) {
      state.from_date = action.payload;
    },
    setToDate(state, action: PayloadAction<number | undefined>) {
      state.to_date = action.payload;
    },
    setQ(state, action: PayloadAction<string | undefined>) {
      state.q = action.payload ? action.payload.trim() : '';
    },
    setBasemapSource: (state, action: PayloadAction<MapBaseLayerKeyType>) => {
      state.basemapSource = action.payload;
      // localStorage.setItem('basemap_source', state.basemapSource);
    },
    setSource: (state, action: PayloadAction<FeatureSourceAttributeType>) => {
      state.source = action.payload;
    },
    setPreviousQueryString: (state) => {
      state.previousQueryString = state.queryString;
    },
    setCsvRequesting: (state) => {
      state.requestingCsv = true;
    },
    csvRequestDone: (state) => {
      state.requestingCsv = false;
    },
    csvRequestFailed: (state) => {
      state.requestingCsv = false;
    },
    setRequestingFeatures: (state, action: PayloadAction<boolean>) => {
      state.requestingFeatures = action.payload;
    },
    failedFeaturesRequest: (state) => {
      state.featureCollection = undefined;
      state.previousQueryString = '';
      state.requestingFeatures = false;
      state.queryString = '';
    },
  },
});

export const {
  setMapParams,
  setQ, resetDates, setFromDate, setToDate,
  setBasemapSource, setSource,
} = mapSlice.actions;

export const selectBasemapSource = (state: RootState) => state.map.basemapSource as MapBaseLayerKeyType;

export const selectPointsCount = createSelector(
  (state: RootState) => state.map.featureCollection,
  (featureCollection: UfoFeatureCollectionType | undefined): number => featureCollection?.pointsCount ?? 0
);

export const selectClusterCount = createSelector(
  (state: RootState) => state.map.featureCollection,
  (featureCollection: UfoFeatureCollectionType | undefined) => featureCollection?.clusterCount ?? 0
);

export const fetchFeatures = createAsyncThunk<
  void,
  void,
  { state: RootState, dispatch: AppDispatch }
>(
  'data/fetchData',
  async (_, { dispatch, getState }) => {
    const mapState = getState().map;
    if (mapState.requestingFeatures) {
      console.log('fetchFeatures - bail as already requesting');
      return;
    }

    if (!mapState.zoom || !mapState.bounds) {
      console.warn('setQueryString: no bounds or zoom');
      return;
    }

    const { previousQueryString, queryString } = setQueryString(mapState);

    if (!queryString || previousQueryString === queryString) {
      console.debug('fetchFeatures - skipping duplicate or empty query');
      return;
    }

    dispatch(mapSlice.actions.setPreviousQueryString());
    dispatch(mapSlice.actions.setRequestingFeatures(true));

    try {
      const response = await fetch(`${searchEndpoint}?${queryString}`);
      const data: SearchResposneType = await response.json();
      dispatch(mapSlice.actions.setFeatureCollection(data));
    } catch (error) {
      console.error(error);
      dispatch(mapSlice.actions.failedFeaturesRequest());
    } finally {
      dispatch(mapSlice.actions.setRequestingFeatures(false));
    }
  }
);


export const fetchCsv = createAsyncThunk<
  void,
  void,
  { state: RootState, dispatch: AppDispatch }
>(
  'data/fetchCsv',
  async (_, { dispatch, getState }) => {
    const mapState = getState().map;
    const { queryString } = setQueryString(mapState);

    dispatch(mapSlice.actions.setCsvRequesting());

    console.log('fetchCsv: ', queryString);

    try {
      const response = await fetch(`${searchEndpoint}?${queryString}`, {
        headers: {
          accept: 'text/csv',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      downloadCsvBlob(blob);
      dispatch(mapSlice.actions.csvRequestDone());
    } catch (error) {
      console.error(error);
      dispatch(mapSlice.actions.csvRequestFailed());
    }
  }
);


export default mapSlice.reducer;

