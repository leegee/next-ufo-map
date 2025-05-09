"use client";

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { useSelector, useDispatch } from 'react-redux';
import debounce from 'debounce';
import { Map, type MapBrowserEvent, View } from 'ol';
import { FeatureLike } from 'ol/Feature';
import { fromLonLat, transformExtent } from 'ol/proj';
import { easeOut } from 'ol/easing';
import type Layer from 'ol/layer/Layer';

import config from '../lib/shared/config';
import { RootState } from '../redux/store';
import { setMapParams, fetchFeatures, selectBasemapSource, selectPointsCount, resetDates } from '../redux/mapSlice';
import { setSelectionId } from '../redux/guiSlice';
import { setupFeatureHighlighting } from './Map/VectorLayerHighlight';
import Tooltip from './Map/Tooltip';
import createLabelsLayer from '../lib/client/map-base-layer/layer-labels';

import careateBaseLayerDark from '../lib/client/map-base-layer/layer-dark';
import createBaseLayerLight from '../lib/client/map-base-layer/layer-osm';
import createBaseLayerGeo from '../lib/client/map-base-layer/layer-geo';

import { updateVectorLayer as updateClusterOnlyLayer, createHeatmapVectorLayer, setupHeatmapListeners } from '../lib/client/HeatmapLayer';
import { updateVectorLayer as updatePointsLayer, createPointsVectorLayer } from '../lib/client/PointsVectorLayer';
// import { tilesLayer } from '../lib/client/TilesLayer';
import ThemeToggleButton from './Map/ThemeToggleButton';
import LabelToggleButton from './Map/LabelToggleButton';
import LocaleManager from './LocaleManager';
import HelpButton from './Map/HelpButton';

import 'ol/ol.scss';
import './Map.scss';

export type MapBaseLayerKeyType = 'dark' | 'light' | 'geo';
export type MapLayerKeyType = 'clusterOnly' | 'points' | 'tiles'; // | 'mixedSearchResults'
export type MapBaseLayersType = {
  [key in MapBaseLayerKeyType]: Layer
}

type MapLayersType = {
  [key in MapLayerKeyType]: Layer;
}

const TESTING_TILES = false;
const INITIAL_LAYER_NAME = TESTING_TILES ? 'tiles' : 'clusterOnly';

const labelsLayer = createLabelsLayer();

const mapLayers: MapLayersType = {
  // no:  mixedSearchResults: mixedSearchResultsLayer,
  clusterOnly: null,
  points: null,
  tiles: null,
};

const mapBaseLayers: MapBaseLayersType = {
  dark: null,
  light: null,
  geo: null,
};

function setTheme(baseLayerName: MapBaseLayerKeyType) {
  for (const layer of Object.keys(mapBaseLayers)) {
    if (mapBaseLayers[layer as MapBaseLayerKeyType] !== null) {
      mapBaseLayers[layer as MapBaseLayerKeyType].setVisible(layer === baseLayerName);
    }
  }
}

function setVisibleDataLayer(layerName: MapLayerKeyType) {
  for (const l of Object.keys(mapLayers)) {
    if (mapLayers[l as MapLayerKeyType] !== null) {
      mapLayers[l as MapLayerKeyType].setVisible(l === layerName);
      console.log('layer ', l, mapLayers[l as MapLayerKeyType].getVisible());
    }
  }
}

function extentMinusPanel(bounds: [number, number, number, number]) {
  // Calculate the width of the extent
  const extentWidth = bounds[2] - bounds[0];
  // 30vw
  const newMinx = bounds[0] + (extentWidth * 0.3);
  return [newMinx, bounds[1], bounds[2], bounds[3]] as [number, number, number, number];
}

const OpenLayersMap: React.FC = () => {
  const dispatch = useDispatch();
  const pointsCount = useSelector(selectPointsCount);
  const { center, zoom, bounds, featureCollection, q } = useSelector((state: RootState) => state.map);
  const basemapSource: MapBaseLayerKeyType = useSelector(selectBasemapSource);
  const { selectionId, showLabels } = useSelector((state: RootState) => state.gui);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const router = useRouter();

  const handleMoveEnd = () => {
    if (!mapRef.current) return;
    const center = mapRef.current.getView().getCenter() as [number, number];
    const zoom = Number(mapRef.current.getView().getZoom()) || 1;
    const extent = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
    const bounds = transformExtent(extent, 'EPSG:3857', 'EPSG:4326') as [number, number, number, number];

    dispatch(setMapParams({
      center,
      zoom,
      bounds: config.flags.USE_BOUNDS_WITHOUT_PANEL ? extentMinusPanel(bounds) : bounds
    }));
  };

  // Zoom to the cluster or point on click
  function handleMapClick(e: MapBrowserEvent<any>, eventType: 'single' | 'double') {
    let didOneFeature = false;
    mapRef.current?.forEachFeatureAtPixel(e.pixel, function (clickedFeature: FeatureLike): void {
      if (!didOneFeature) {
        // Clicked a clsuter
        if (clickedFeature.get('cluster_id')) {
          dispatch(setSelectionId(undefined));
          mapRef.current?.getView().animate({
            center: e.coordinate,
            zoom: config.zoomLevelForPoints,
            duration: 200,
            easing: easeOut
          });
        }
        else {
          // Clicked a point
          const id = Number(clickedFeature.get('id'));
          dispatch(resetDates());
          dispatch(setSelectionId(id));
          if (eventType === 'double') {
            router.push(`/sighting/${clickedFeature.get('id')}`);
          }
        }
        didOneFeature = true;
      }
    });

    if (!didOneFeature) {
      dispatch(setSelectionId(undefined));
    }
  }

  useEffect(() => {
    setTheme(basemapSource);
  }, [basemapSource]);

  useEffect(() => {
    labelsLayer.setVisible(showLabels);
  }, [showLabels]);

  // Re-render visible layers when user selects a point
  useEffect(() => {
    Object.values(mapLayers).forEach((layer) => {
      if (layer && layer.getVisible()) {
        const source = layer.getSource();
        source?.changed();
      }
    });
  }, [selectionId]);


  useEffect(() => {
    if (mapElementRef.current) {
      // Create base layers
      const baseLayers = {
        dark: careateBaseLayerDark(),
        light: createBaseLayerLight(),
        geo: createBaseLayerGeo(),
      };

      // Create data layers
      const dataLayers = {
        clusterOnly: createHeatmapVectorLayer(),
        points: createPointsVectorLayer(),
      };

      const map = new Map({
        target: mapElementRef.current,
        view: new View({
          center: fromLonLat(center),
          zoom,
          minZoom: 4,
        }),
        layers: [
          ...Object.values(baseLayers),
          labelsLayer,
          ...Object.values(dataLayers),
        ],
      });

      mapRef.current = map;

      setVisibleDataLayer(INITIAL_LAYER_NAME);
      setupHeatmapListeners(mapRef.current);
      setupFeatureHighlighting(mapRef.current);

      map.on('moveend', debounce(handleMoveEnd, Number(config.gui.debounce || 300), { immediate: true }));

      map.on('click', debounce((e: MapBrowserEvent<any>) => handleMapClick(e, 'single'), Number(config.gui.debounce), { immediate: true }));
      map.on('dblclick', debounce((e: MapBrowserEvent<any>) => handleMapClick(e, 'double'), Number(config.gui.debounce), { immediate: true }));
    }

    return () => mapRef.current?.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);


  if (!TESTING_TILES) {
    useEffect(() => {
      const debouncedFetchFeatures = debounce(() => {
        dispatch(fetchFeatures());
      }, 750);
      debouncedFetchFeatures();
    }, [dispatch, bounds, zoom]);
  }

  useEffect(() => {
    if (TESTING_TILES) return;
    if (!mapElementRef.current || !featureCollection) return;
    if (q && q.length >= config.minQLength && (!pointsCount || pointsCount < 1000)) {
      updatePointsLayer(featureCollection);
      setVisibleDataLayer('points');
    } else if (!pointsCount || zoom < config.zoomLevelForPoints) {
      updateClusterOnlyLayer(featureCollection);
      setVisibleDataLayer('clusterOnly');
    } else {
      updatePointsLayer(featureCollection);
      setVisibleDataLayer('points');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureCollection]);

  return (
    <section id='map' ref={mapElementRef}>
      <div className='map-ctrls'>
        <ThemeToggleButton />
        <LabelToggleButton />
        <LocaleManager />
        <HelpButton />
      </div>
      {mapRef.current && <Tooltip map={mapRef.current} />}
    </section>
  );
};



export default OpenLayersMap;

