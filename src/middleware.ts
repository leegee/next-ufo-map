import { NextRequest, NextResponse } from 'next/server'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function middleware(request: NextRequest) {
    console.log('Middleware hit:', request.nextUrl.pathname)

    const isPreflight = request.method === 'OPTIONS';

    if (isPreflight) {
        return NextResponse.json({}, { headers: corsHeaders });
    }

    const response = NextResponse.next()
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    })

    return response;
}

export const config = {
    matcher: '/api/:path*',
}
