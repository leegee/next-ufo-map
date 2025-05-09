"use client";

import { bbox } from "ol/loadingstrategy";
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';

import type { UfoFeatureCollectionType } from '../../types';
import { sightingsStyleFunction } from "./map-style";

let vectorSource: VectorSource | undefined;
let vectorLayer: VectorLayer | undefined;

export function createPointsVectorLayer() {
    vectorSource = new VectorSource({
        strategy: bbox,
        format: new GeoJSON(),
    });

    vectorLayer = new VectorLayer({
        source: vectorSource,
        style: sightingsStyleFunction,
    });

    vectorLayer.set('name', 'points');

    return vectorLayer;
}

export function updateVectorLayer(featureCollection: UfoFeatureCollectionType) {
    if (!vectorSource) return;

    vectorSource.clear();
    vectorSource.addFeatures(new GeoJSON().readFeatures(featureCollection));
    vectorSource.changed();
    console.debug("Number of features added:", vectorSource.getFeatures().length);
}
