"use client";

import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

export default function createGeoBaseLayer() {
    if (typeof window !== 'undefined') {
        return new TileLayer({
            visible: false,
            source: new XYZ({
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attributions: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            }),
        });
    }
}