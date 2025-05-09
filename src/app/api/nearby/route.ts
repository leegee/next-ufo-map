import { getNearbyPoints } from '@/lib/db'; // use @/ because of Next.js alias
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lon = parseFloat(searchParams.get('lon') || '');

    if (isNaN(lat) || isNaN(lon)) {
        return new Response(JSON.stringify({ error: 'Invalid coordinates' }), { status: 400 });
    }

    const points = await getNearbyPoints(lat, lon);
    return new Response(JSON.stringify(points), { status: 200 });
}
