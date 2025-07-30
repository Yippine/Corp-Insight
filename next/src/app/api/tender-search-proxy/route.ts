import { NextRequest, NextResponse } from 'next/server';
import { getCachedApiData, setCachedApiData } from '@/lib/mongodbUtils';

const PCC_API_CACHE_COLLECTION = 'pcc_api_cache';
const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 小時

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taxId = searchParams.get('taxId');
  const page = searchParams.get('page') || '1'; // Default to page 1 if not provided

  if (!taxId) {
    return NextResponse.json(
      { error: 'Missing taxId parameter' },
      { status: 400 }
    );
  }

  const externalApiUrl = `https://pcc-api.openfun.app/api/searchbycompanyid?query=${taxId}&page=${page}`;
  const apiKey = externalApiUrl; // Use the full external URL as the cache key

  try {
    // 1. Try to get data from MongoDB cache
    const cachedData = await getCachedApiData<any>(
      PCC_API_CACHE_COLLECTION,
      apiKey
    );
    if (cachedData) {
      // console.log(`Cache HIT for ${apiKey} in tender-search-proxy`);
      return NextResponse.json(cachedData);
    }

    // console.log(`Cache MISS for ${apiKey} in tender-search-proxy. Fetching from external API.`);
    // 2. If cache miss, fetch from the external API
    const response = await fetch(externalApiUrl, {
      mode: 'cors',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `External API error! status: ${response.status} for ${externalApiUrl}`
      );
    }

    const data = await response.json();

    // 3. Store the fetched data in MongoDB cache
    if (data) {
      await setCachedApiData(
        PCC_API_CACHE_COLLECTION,
        apiKey,
        data,
        CACHE_TTL_SECONDS
      );
      // console.log(`Stored ${apiKey} in cache from tender-search-proxy`);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in tender-search-proxy for ${apiKey}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch tender search data', details: errorMessage },
      { status: 500 }
    );
  }
}

// Ensure this route is treated as dynamic
export const dynamic = 'force-dynamic';
