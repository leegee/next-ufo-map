'use client';

import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

export default function createOsmBaseLayer() {
    if (typeof window !== 'undefined') {
        return new TileLayer({
            source: new OSM(),
            visible: false,
        },);
    }
}

