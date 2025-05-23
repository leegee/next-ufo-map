"use client";

import TileLayer from 'ol/layer/VectorTile';
import { VectorTile } from 'ol/source';
import MVT from 'ol/format/MVT';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import config from './config';

const sightingsStyleFunction = () => {
    return new Style({
        image: new Circle({
            radius: 116,
            fill: new Fill({
                color: 'yellow',
            }),
            stroke: new Stroke({
                color: 'rgba(255, 255, 255, 0.8)',
                width: 2,
            }),
        }),
    });
};

export const tilesLayer = new TileLayer({
    style: sightingsStyleFunction,
    source: new VectorTile({
        format: new MVT(),
        url: `${config.api.url}${config.api.endpoints.tiles}/{z}/{x}/{y}.mvt`,
        tileSize: 256,
        maxZoom: 19,
    }),
});

