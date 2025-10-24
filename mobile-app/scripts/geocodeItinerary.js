import 'dotenv/config';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Sleep helper for API rate limiting
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Geocode a location string
async function geocodeLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'DrTravelandToursApp/1.0' } });
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), name: data[0].display_name };
}

// Extract probable location phrases from text
function extractLocationCandidates(activity) {
  // Split by common separators
  const chunks = activity.split(/,| and |;|\.|\n/).map(s => s.trim()).filter(Boolean);

  // Further split by prepositions like "in", "at", "to" to isolate location
  const candidates = [];
  for (const chunk of chunks) {
    const prepositionSplit = chunk.split(/\b(in|at|to|on)\b/i);
    const possibleLocation = prepositionSplit[prepositionSplit.length - 1].trim();
    if (possibleLocation && possibleLocation.length > 2) {
      candidates.push(possibleLocation);
    }
  }

  return candidates;
}

// Process a single table
async function processTable(tableName) {
  const { data: packages } = await supabase.from(tableName).select('id, name, itinerary');

  for (const pkg of packages) {
    if (!pkg.itinerary) continue;

    let itinerary;
    try {
      itinerary = typeof pkg.itinerary === 'string' ? JSON.parse(pkg.itinerary) : pkg.itinerary;
    } catch {
      console.error(`❌ Failed to parse itinerary for ${pkg.name} in ${tableName}`);
      continue;
    }

    let updated = false;

    for (const day of itinerary) {
      day.locations = [];
      const seen = new Set();

      for (const activity of day.activities) {
        const candidates = extractLocationCandidates(activity);

        for (const candidate of candidates) {
          if (!seen.has(candidate)) {
            const coords = await geocodeLocation(candidate);
            await sleep(1000); // Respect API limits

            if (coords) {
              day.locations.push({ name: coords.name, coords: { lat: coords.lat, lon: coords.lon } });
              seen.add(candidate);
              updated = true;
              console.log(`📍 [${tableName}] Geocoded "${candidate}" → ${coords.name}`);
            } else {
              console.log(`⚠️ [${tableName}] Could not geocode "${candidate}"`);
            }
          }
        }
      }
    }

    if (updated) {
      await supabase.from(tableName).update({ itinerary }).eq('id', pkg.id);
      console.log(`✅ Updated itinerary for ${pkg.name} in ${tableName}`);
    }
  }
}

async function main() {
  await processTable('package_info');
  await processTable('local_package_info');
  console.log('🎉 Done geocoding all itineraries in both tables!');
}

main();
