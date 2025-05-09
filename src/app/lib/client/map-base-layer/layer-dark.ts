'use client';

import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

export default function createDarkBaseLayer() {
    if (typeof window !== 'undefined') {
        return new TileLayer({
            source: new XYZ({
                url: 'https://{1-4}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                attributions: 'CartoDB'
            }),
        });
    }
}


