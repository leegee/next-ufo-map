import { FeatureLike } from "ol/Feature";
import { Circle, Fill, Icon, Stroke, Style, Text } from "ol/style";

import { store } from "../../redux/store";

const bgSaturation = 100;
const bgLightness = 50;
const borderSaturation = 80;
const borderLightness = 20;

export function mapScoreToHue(score: number): number {
    const value = Math.min(Math.max(score, 0), 1);
    const hue = (1 + value) * 180;
    return hue;
}

function mapLocalClusterToColor(): string {
    // console.log(feature)
    return 'blue';
}

const rings = [
    new Style({
        image: new Circle({
            radius: 100,
            fill: new Fill({ color: 'transparent' }),
            stroke: new Stroke({ width: 2, color: 'lime' }),
        }),
    }),
    new Style({
        image: new Circle({
            radius: 50,
            fill: new Fill({ color: 'transparent' }),
            stroke: new Stroke({ width: 2, color: 'lime' }),
        }),
    }),
];

export const sightingsStyleFunction = (feature: FeatureLike): Style | Style[] => {
    const features = feature.get('features') as FeatureLike[] | undefined;
    const clusterSizeFromServer = Number(feature.get('num_points'));
    const clusterSizeMadeLocally = features ? features.length : undefined;
    let style;

    if (clusterSizeFromServer) {
        style = new Style({
            stroke: new Stroke({
                color: 'rgba(25, 25, 255, 0.9)',
                width: 1
            }),
            fill: new Fill({
                color: 'rgba(78, 197, 215, 0.7)'
            }),
            image: new Circle({
                radius: 12,
                fill: new Fill({ color: 'rgba(25, 25, 255, 0.7)' }),
                stroke: new Stroke({ color: '#3399CC', width: 2 })
            }),
            text: new Text({
                text: clusterSizeFromServer.toString(),
                fill: new Fill({ color: 'white' }),
                backgroundFill: new Fill({ color: 'rgba(25, 25, 255, 0.7)' }),
                stroke: new Stroke({ color: '#3399CC', width: 1 }),
                scale: 1.5,
                overflow: true,
                textAlign: 'center',
                textBaseline: 'middle',
                maxAngle: Math.PI / 4,
            })
        });
    }

    else if (clusterSizeMadeLocally) {
        const background = mapLocalClusterToColor();
        style = new Style({
            image: new Circle({
                radius: 10,
                fill: new Fill({ color: background }),
                stroke: new Stroke({ color: '#3399CC', width: 2 })
            }),
            text: new Text({
                text: clusterSizeMadeLocally.toString(),
                fill: new Fill({ color: 'white' })
            })
        });
    }

    else {
        // Points
        const rgb = feature.get('rgb') as string;
        const selectionId = store.getState().gui.selectionId;
        const selected = selectionId && selectionId === feature.get('id');
        const score = parseFloat(feature.get('search_score') as string);
        const hue = 180;
        let alpha = 1;
        if (score) {
            // (feature as Feature).set('zIndex', score * 2);
            alpha = score + 0.2;
            if (alpha < 0.55) {
                alpha = 0.55
            }
        }
        let colour = rgb;
        if (!rgb || rgb === 'Unknown') {
            colour = `hsla(${hue}, ${bgSaturation}%, ${bgLightness}%, ${alpha})`;
        }

        const shape = undefined; // feature.get('shape');
        const shapeIcon = shape && !['0', '1', '2', '3', ''].includes(shape) ? 'icons/' + shape + '.svg' : null;

        const fallbackStyle = new Circle({
            radius: 10,
            fill: new Fill({
                color: selected ? 'hsl(40,100%,70%)' : colour,
            }),
            stroke: new Stroke(
                selected
                    ? {
                        color: 'hsl(40,100%,60%)',
                        width: 8,
                    }
                    : {
                        color: `hsla(${hue}, ${borderSaturation}%, ${borderLightness}%, ${alpha})`,
                        width: 3,
                    }
            ),
        });

        style = [
            ...(selected ? rings : []),
            new Style({
                image: shapeIcon
                    ? new Icon({
                        src: shapeIcon,
                        scale: 0.05, // TODO
                        color: selected ? 'hsl(40,100%,70%)' : undefined, // TODO;
                    })
                    : fallbackStyle,
            }),
        ];
    }

    return style;
};

/* 
disk

 cone
 triangle
 round
 flare
 formation
 fireball
 circle
 crescent
 cross
 chevron
 light
 pyramid
 dome
 changing
 unknown
 egg
 sphere
 hexagon
 rectangle
 cigar
 diamond
 oval
 delta
 teardrop
 flash
 other
 changed
 cylinder

 */