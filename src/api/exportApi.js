import axios from 'axios';

// Use the same base URL logic as api.js
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

export const exportApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000,
  responseType: 'blob',
});

exportApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('Export API Request:', {
      url: config.url,
      params: config.params,
      headers: config.headers,
      baseURL: config.baseURL
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

exportApi.interceptors.response.use(
  (response) => {
    console.log('Export API Response:', {
      status: response.status,
      headers: response.headers,
      size: response.data?.size || 'unknown'
    });
    return response;
  },
  (error) => {
    console.error('Export API Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        params: error.config?.params,
        timeout: error.config?.timeout
      }
    });
    
    if (error.response?.data instanceof Blob) {
      return error.response.data.text().then(text => {
        console.error('Error response text:', text);
        throw new Error(`Export failed: ${error.response.status} - ${text || error.response.statusText}`);
      }).catch(() => {
        throw new Error(`Export failed: ${error.response.status} - ${error.response.statusText}`);
      });
    }
    
    return Promise.reject(error);
  }
);

function validateExportParams(params) {
  const errors = [];
  
  if (params.timeframeInWeeks < 1) {
    errors.push('Timeframe must be at least 1 week');
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
}

export async function exportJobPostsAsJson({
  country,
  timeframeInWeeks = 1,
  contractType = '',
  contractTime = '',
  workLocation = '',
  title = '',
  location = '',
  company = '',
  skills = [],
  languages = [],
  onlyFavorites = false
}) {
  // Validate parameters
  validateExportParams({ country, timeframeInWeeks });
  
  const params = new URLSearchParams();
  
  // Only append countryCode if it's not empty (following the pattern from api.js)
  if (country && country.trim() !== '') {
    params.append('countryCode', country.trim());
  }
  params.append('timeframeInWeeks', timeframeInWeeks.toString());
  
  // Only append non-empty parameters
  if (contractType?.trim()) params.append('contractType', contractType.trim());
  if (contractTime?.trim()) params.append('contractTime', contractTime.trim());
  if (workLocation?.trim()) params.append('workLocation', workLocation.trim());
  if (title?.trim()) params.append('title', title.trim());
  if (location?.trim()) params.append('location', location.trim());
  if (company?.trim()) params.append('company', company.trim());
  if (onlyFavorites) params.append('onlyFavorites', 'true');
  
  // Add arrays
  (skills || []).filter(s => s?.trim()).forEach(s => params.append('skills', s.trim()));
  (languages || []).filter(l => l?.trim()).forEach(l => params.append('languages', l.trim()));

  try {
    const countryLabel = country && country.trim() !== '' ? country : 'AllCountries';
    console.log(`Starting JSON export with params (Country: ${countryLabel}):`, Object.fromEntries(params));
    
    const response = await exportApi.get('/api/Adzuna/export-job-posts-json', {
      params,
      responseType: 'blob',
      timeout: 600000
    });

    // Verify it's actually a blob with content
    if (!response.data || response.data.size === 0) {
      throw new Error('Export returned empty response');
    }

    // Create download link
    const blob = new Blob([response.data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Generate filename with proper country label
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `JobPosts_${countryLabel}_${timestamp}.json`;
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    console.log('JSON export completed successfully:', filename);
    return { success: true, filename };
    
  } catch (error) {
    console.error('JSON Export failed:', error);
    throw new Error(`Failed to export job posts as JSON: ${error.message}`);
  }
}

export async function exportJobPostsAsCsv({
  country,
  timeframeInWeeks = 1,
  contractType = '',
  contractTime = '',
  workLocation = '',
  title = '',
  location = '',
  company = '',
  skills = [],
  languages = [],
  onlyFavorites = false
}) {
  // Validate parameters
  validateExportParams({ country, timeframeInWeeks });
  
  const params = new URLSearchParams();
  
  // Only append countryCode if it's not empty (matching JSON export behavior)
  if (country && country.trim() !== '') {
    params.append('countryCode', country.trim());
  }
  params.append('timeframeInWeeks', timeframeInWeeks.toString());
  
  // Only append non-empty parameters
  if (contractType?.trim()) params.append('contractType', contractType.trim());
  if (contractTime?.trim()) params.append('contractTime', contractTime.trim());
  if (workLocation?.trim()) params.append('workLocation', workLocation.trim());
  if (title?.trim()) params.append('title', title.trim());
  if (location?.trim()) params.append('location', location.trim());
  if (company?.trim()) params.append('company', company.trim());
  if (onlyFavorites) params.append('onlyFavorites', 'true');
  
  // Add arrays
  (skills || []).filter(s => s?.trim()).forEach(s => params.append('skills', s.trim()));
  (languages || []).filter(l => l?.trim()).forEach(l => params.append('languages', l.trim()));

  try {
    const countryLabel = country && country.trim() !== '' ? country : 'AllCountries';
    console.log(`Starting CSV export with params (Country: ${countryLabel}):`, Object.fromEntries(params));
    
    const response = await exportApi.get('/api/Adzuna/export-job-posts-csv', {
      params,
      responseType: 'blob',
      timeout: 600000 
    });

    // Verify it's actually a blob with content
    if (!response.data || response.data.size === 0) {
      throw new Error('Export returned empty response');
    }

    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Generate filename with proper country label (same logic as JSON export)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `JobPosts_${countryLabel}_${timestamp}.csv`;
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    console.log('CSV export completed successfully:', filename);
    return { success: true, filename };
    
  } catch (error) {
    console.error('CSV Export failed:', error);
    throw new Error(`Failed to export job posts as CSV: ${error.message}`);
  }
}