import axios from 'axios';
import qs from 'qs'

let API_BASE_URL;
if (typeof window !== 'undefined') {
  const host = window.location.hostname;
  API_BASE_URL =
    host === 'localhost' || host === '127.0.0.1'
      ? 'https://localhost:7017'
      : 'https://peria-pulse-be-dev-audxeahdbuhqbjah.westeurope-01.azurewebsites.net';
} else {
  API_BASE_URL = 'https://peria-pulse-be-dev-audxeahdbuhqbjah.westeurope-01.azurewebsites.net';
}

console.log('Using API base:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export async function fetchJobPosts({
  country,
  page = 1,
  pageSize = 10,
  timeframeInWeeks = 1,
  contractType = '',
  contractTime = '',
  workLocation = '',
  title = '',
  location = '',
  company = '',
  skills = [],
  languages = [],
  onlyFavorites = false,
  // Cursor pagination parameters
  lastCreated = null,
  lastJobId = null,
  useCursorPagination = false
}) {
  const params = new URLSearchParams();
  
  if (country && country.trim() !== '') {
    params.append('countryCode', country);
  }
  params.append('page', page);
  params.append('pageSize', pageSize);
  params.append('timeframeInWeeks', timeframeInWeeks);
  
  if (contractType) params.append('contractType', contractType);
  if (contractTime) params.append('contractTime', contractTime);
  if (workLocation) params.append('workLocation', workLocation);
  if (title) params.append('title', title);
  if (location) params.append('location', location);
  if (company) params.append('company', company);
  if (onlyFavorites) params.append('onlyFavorites', onlyFavorites);
  
  // Handle cursor pagination parameters
  if (useCursorPagination) {
    params.append('useCursorPagination', useCursorPagination);
    if (lastCreated) {
      // Ensure proper ISO format for date
      const dateValue = lastCreated instanceof Date ? lastCreated.toISOString() : lastCreated;
      params.append('lastCreated', dateValue);
    }
    if (lastJobId) params.append('lastJobId', lastJobId);
  }
  
  skills.forEach(s => params.append('skills', s));
  languages.forEach(l => params.append('languages', l));

  const response = await api.get('/api/Adzuna/get-job-posts', {
    params
  });

  // Extract cursor pagination metadata from headers
  const lastCreatedHeader = response.headers['x-lastcreated'];
  const lastJobIdHeader = response.headers['x-lastjobid'];
  const hasNextPageHeader = response.headers['x-hasnextpage'];

  return {
    jobs: response.data.posts || [],
    totalCount: response.data.totalCount || 0,
    totalPages: response.data.totalPages || 1,
    favoriteCount: response.data.favoriteCount || 0,
    message: response.data.message || null,
    // Cursor pagination metadata
    lastCreated: lastCreatedHeader ? new Date(lastCreatedHeader) : null,
    lastJobId: lastJobIdHeader ? parseInt(lastJobIdHeader, 10) : null,
    hasNextPage: hasNextPageHeader ? hasNextPageHeader.toLowerCase() === 'true' : false
  };
}

export async function getCountries() {
  try {
    const { data } = await api.get('/api/Adzuna/countries');
    return data || [];
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
}

export async function getContractTypes({ countryCode = '', timeframeInWeeks = 1 }) {
  const params = new URLSearchParams();
  
  params.append('countryCode', countryCode);
  
  params.append('timeframeInWeeks', timeframeInWeeks);
  
  try {
    const { data } = await api.get('/api/Adzuna/contract-types', { params });
    return data || [];
  } catch (error) {
    console.error('Error fetching contract types:', error);
    return [];
  }
}

export async function getContractTimes({ countryCode = '', timeframeInWeeks = 1 }) {
  const params = new URLSearchParams();
  
  params.append('countryCode', countryCode);
  
  params.append('timeframeInWeeks', timeframeInWeeks);
  
  try {
    const { data } = await api.get('/api/Adzuna/contract-times', { params });
    return data || [];
  } catch (error) {
    console.error('Error fetching contract times:', error);
    return [];
  }
}

export async function getWorkLocations({ countryCode = '', timeframeInWeeks = 1 }) {
  const params = new URLSearchParams();
  
  params.append('countryCode', countryCode);
  
  params.append('timeframeInWeeks', timeframeInWeeks);
  
  try {
    const { data } = await api.get('/api/Adzuna/work-locations', { params });
    return data || [];
  } catch (error) {
    console.error('Error fetching work locations:', error);
    return [];
  }
}

export async function getCompanies({ countryCode = '', timeframeInWeeks = 1 }) {
  const params = new URLSearchParams();
  
  if (countryCode && countryCode.trim() !== '') {
    params.append('countryCode', countryCode);
  }
  
  params.append('timeframeInWeeks', timeframeInWeeks);
  
  try {
    const { data } = await api.get('/api/Adzuna/companies', { params });
    return data || [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

export async function getLocations({ countryCode = '', timeframeInWeeks = 1 }) {
  const params = new URLSearchParams();
  
  if (countryCode && countryCode.trim() !== '') {
    params.append('countryCode', countryCode);
  }
  
  params.append('timeframeInWeeks', timeframeInWeeks);
  
  try {
    const { data } = await api.get('/api/Adzuna/locations', { params });
    return data || [];
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}

export async function getSkills({ countryCode = '', timeframeInWeeks = 1 }) {
  const params = new URLSearchParams();
  
  params.append('countryCode', countryCode);
  
  params.append('timeframeInWeeks', timeframeInWeeks);
  
  try {
    const { data } = await api.get('/api/Adzuna/skills', { params });
    return data || [];
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
}

export async function getLanguages({ countryCode = '', timeframeInWeeks = 1 }) {
  const params = new URLSearchParams();
  
  params.append('countryCode', countryCode);
  
  params.append('timeframeInWeeks', timeframeInWeeks);
  
  try {
    const { data } = await api.get('/api/Adzuna/languages', { params });
    return data || [];
  } catch (error) {
    console.error('Error fetching languages:', error);
    return [];
  }
}

export async function getFilterOptions({
  countryCode = '',
  timeframeInWeeks = 1
}) {
  const params = new URLSearchParams();
  
  if (countryCode && countryCode.trim() !== '') {
    params.append('countryCode', countryCode);
  }
  
  params.append('timeframeInWeeks', timeframeInWeeks);
  
  const { data } = await api.get('/api/Adzuna/filter-options', {
    params
  });
  
  return {
    contractTypes: data.contractTypes || [],
    contractTimes: data.contractTimes || [],
    workLocations: data.workLocations || [],
    companies: data.companies || [],
    locations: data.locations || [],
    skills: data.skills || [],
    languages: data.languages || [],
    countries: data.countries || []
  };
}

export function fetchJobDetails(id) {
  return api.get(`/api/Adzuna/job-details/${id}`).then(res => res.data);
}

export const fetchJobPostsWithCoordinates = (filters) => {
  const cleanedFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0)
    )
  );
  const query = qs.stringify(cleanedFilters, { arrayFormat: 'repeat' });
  
  // Use api instance instead of raw axios
  return api.get(`/api/Adzuna/get-job-posts-with-coordinates?${query}`);
};

// Enhanced function for summary mode (loading map markers)
export const fetchJobLocationsSummary = (countryCode, filters = {}) => {
  const params = {
    countryCode,
    summaryMode: true,
    groupByLocation: true,
    getAll: true,
    timeframeInWeeks: 1,
    ...filters
  };
  
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0)
    )
  );
  
  const query = qs.stringify(cleanedParams, { arrayFormat: 'repeat' });
  
  // Use api instance instead of raw axios
  return api.get(`/api/Adzuna/get-job-posts-with-coordinates?${query}`);
};

// export async function fetchJobPosts({ <<- Backup Endpoint with counts
//   country,
//   page = 1,
//   pageSize = 10,
//   timeframeInWeeks = 1,
//   contractType = '',
//   contractTime = '',
//   workLocation = '',
//   title = '',
//   location = '',
//   company = '',
//   skills = [],
//   languages = [],
//   onlyFavorites = false
// }) {
//   const params = new URLSearchParams();
  
//   // Only append countryCode if it's not empty
//   if (country && country.trim() !== '') {
//     params.append('countryCode', country);
//   }
  
//   params.append('page', page);
//   params.append('pageSize', pageSize);
//   params.append('timeframeInWeeks', timeframeInWeeks);
//   if (contractType)  params.append('contractType', contractType);
//   if (contractTime)  params.append('contractTime', contractTime);
//   if (workLocation)  params.append('workLocation', workLocation);
//   if (title)    params.append('title', title);
//   if (location) params.append('location', location);
//   if (company)  params.append('company', company);
//   if (onlyFavorites) params.append('onlyFavorites', onlyFavorites);
//   skills.forEach(s => params.append('skills', s))
//   languages.forEach(l => params.append('languages', l))
  
//   const { data } = await api.get('/api/Adzuna/get-job-posts', {
//     params
//   })
//   return {
//     jobs:               data.posts               || [],
//     totalCount:         data.totalCount          || 0,
//     totalPages:         data.totalPages          || 1,
//     contractTypeCounts: data.contractTypeCounts  || [],
//     contractTimeCounts: data.contractTimeCounts  || [],
//     workLocationCounts: data.workLocationCounts  || [],
//     companyCounts:      data.companyCounts       || [],
//     locationCounts:     data.locationCounts      || [],
//     skillCounts:        data.skillCounts         || [],
//     languageCounts:     data.languageCounts      || [],
//     countryCounts:      data.countryCounts       || [],
//     favoriteCount:      data.favoriteCount       || 0,
//   }
// }

// Enhanced function for getting all jobs for a specific location
export const fetchLocationJobs = (countryCode, locationId, filters = {}) => {
  const params = {
    countryCode,
    locationId,
    groupByLocation: false,
    getAll: true,
    timeframeInWeeks: 1,
    ...filters
  };
  
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0)
    )
  );
  
  const query = qs.stringify(cleanedParams, { arrayFormat: 'repeat' });
  
  // Use api instance instead of raw axios
  return api.get(`/api/Adzuna/get-job-posts-with-coordinates?${query}`);
};

export async function addToFavorites(Ids) {
  return await api.post('/api/favorites/add-to-favorites', Ids);
}

export async function removeFromFavorites(Ids) {
  return await api.delete('/api/favorites/remove-from-favorites', { data: Ids });
}

export async function checkIfFavorited(Id) {
  const { data } = await api.get(`/api/favorites/check/${Id}`);
  return data.isFavorite;
}

export async function fetchFavorites() {
  const { data } = await api.get('/api/favorites/get-all-favorites');
  return data;
}

export { API_BASE_URL };
