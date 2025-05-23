"use client";

import type { Map, View } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import { bbox } from "ol/loadingstrategy";
import { Heatmap as HeatmapLayer } from 'ol/layer';
import type { UfoFeatureCollectionType } from '../../types';

let vectorSource: VectorSource | undefined;
let vectorLayer: HeatmapLayer | undefined;

export function createHeatmapVectorLayer() {
    vectorSource = new VectorSource({
        format: new GeoJSON(),
        strategy: bbox,
    });

    vectorLayer = new HeatmapLayer({
        source: vectorSource,
        radius: 7,
        blur: 10,
        weight: (feature) => {
            return Number(feature.get('num_points')) + 1;
        },
    });

    vectorLayer.set('name', 'server-clusters-only');

    return vectorLayer;
}

export function updateVectorLayer(featureCollection: UfoFeatureCollectionType) {
    vectorSource.clear();
    vectorSource.addFeatures(new GeoJSON().readFeatures(featureCollection));
    vectorSource.changed();
    // console.debug("Number of features added:", vectorSource.getFeatures().length);
}

export function setupHeatmapListeners(map: Map) {
    map.on('moveend', () => updateLayerProperties(map));
}

function updateLayerProperties(map: Map) {
    const view = map.getView() as View | undefined;
    if (!view) {
        return;
    }
    const zoom: number = view.getZoom() ?? 0;
    const newRadius = zoom >= 6 ? 14 : 5;
    const newBlur = zoom >= 6 ? 18 : 7;

    vectorLayer.setBlur(newBlur);
    vectorLayer.setRadius(newRadius);
}
