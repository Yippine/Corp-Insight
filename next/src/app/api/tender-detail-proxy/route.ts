import { NextRequest, NextResponse } from 'next/server';
import { getCachedApiData, setCachedApiData } from '@/lib/mongodbUtils';

const PCC_API_CACHE_COLLECTION = 'pcc_api_cache';
const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 小時

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const unitId = searchParams.get('unit_id');
  const jobNumber = searchParams.get('job_number');
  // The date and type parameters from the original useTenderDetail are not directly used for the external API call key,
  // but they are part of what makes a specific record unique if multiple records exist for the same unit_id & job_number.
  // However, the external API only takes unit_id and job_number. The caching key will be based on this.
  // The selection of the specific record (if multiple) happens client-side after fetching all records for unit_id/job_number.

  if (!unitId || !jobNumber) {
    return NextResponse.json(
      { error: 'Missing unit_id or job_number parameter' },
      { status: 400 }
    );
  }

  const externalApiUrl = `https://pcc-api.openfun.app/api/tender?unit_id=${unitId}&job_number=${jobNumber}`;
  const apiKey = externalApiUrl; // Use the full external URL as the cache key for this specific tender detail

  try {
    const cachedData = await getCachedApiData<any>(
      PCC_API_CACHE_COLLECTION,
      apiKey
    );
    if (cachedData) {
      // console.log(`Cache HIT for ${apiKey} in tender-detail-proxy`);
      return NextResponse.json(cachedData);
    }

    // console.log(`Cache MISS for ${apiKey} in tender-detail-proxy. Fetching from external API.`);
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

    if (data) {
      await setCachedApiData(
        PCC_API_CACHE_COLLECTION,
        apiKey,
        data,
        CACHE_TTL_SECONDS
      );
      // console.log(`Stored ${apiKey} in cache from tender-detail-proxy`);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in tender-detail-proxy for ${apiKey}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch tender detail data', details: errorMessage },
      { status: 500 }
    );
  }
}

// Ensure this route is treated as dynamic
export const dynamic = 'force-dynamic';
