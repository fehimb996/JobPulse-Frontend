import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { fetchJobLocationsSummary, fetchLocationJobs } from '@/api/api';
import './JobMap.css';

const mapContainerStyle = { width: '100%', height: '100%' };

const defaultZooms = {
  DE: 6,
  GB: 6,
  US: 4,
  NL: 7,
  BE: 8,
  AT: 7,
  CH: 7,
  NO: 5,
  DK: 7,
};

const getFlagEmoji = (countryCode) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

const countryNames = {
  DE: 'Germany',
  GB: 'United Kingdom',
  US: 'USA',
  NL: 'Netherlands',
  BE: 'Belgium',
  AT: 'Austria',
  CH: 'Switzerland',
  NO: 'Norway',
  DK: 'Denmark'
};

const countries = Object.keys(countryNames);

// Timeframe options
const timeframeOptions = [
  { value: 1, label: '1 Week' },
  { value: 2, label: '2 Weeks' },
  { value: 3, label: '3 Weeks' },
  { value: 4, label: '4 Weeks' }
];

const getCurrencySymbol = (countryCode) => {
  switch (countryCode) {
    case 'GB': return '£';
    case 'CH': return 'CHF';
    case 'US': return '$';
    case 'NO': return 'NOK';
    case 'DK': return 'DKK';
    default: return '€';
  }
};

const formatCurrency = (value) => {
  if (value == null) return '-';
  return new Intl.NumberFormat('de-DE', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const defaultCenters = {
  DE: { lat: 51.1657, lng: 10.4515 },
  GB: { lat: 54.7023, lng: -3.2765 },
  US: { lat: 39.8283, lng: -98.5795 },
  NL: { lat: 52.1326, lng: 5.2913 },
  BE: { lat: 50.8503, lng: 4.3517 },
  AT: { lat: 47.5162, lng: 14.5501 },
  CH: { lat: 46.8182, lng: 8.2275 },
  NO: { lat: 63.0472, lng: 10.4405 },
  DK: { lat: 56.2639, lng: 9.5018 },
};

const JobMap = () => {
  const [countryCode, setCountryCode] = useState('DE');
  const [timeframeInWeeks, setTimeframeInWeeks] = useState(1);
  const [locationGroups, setLocationGroups] = useState([]);
  const [selectedLocationJobs, setSelectedLocationJobs] = useState([]);
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState(null);
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    if (!isLoaded) return;
    
    const loadLocationSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        setSelectedLocationJobs([]);
        setSelectedLocationName('');

        const res = await fetchJobLocationsSummary(countryCode, { timeframeInWeeks });
        setLocationGroups(res.data.locationGroups || []);
      } catch (err) {
        console.error('Error loading location summary:', err);
        setError(`Failed to load job locations: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadLocationSummary();
  }, [isLoaded, countryCode, timeframeInWeeks]);

  const handleMarkerClick = async (locationGroup) => {
    if (!locationGroup.locationId) return;
    
    try {
      setLoadingJobs(true);
      setSelectedLocationName(locationGroup.locationName);
      
      const res = await fetchLocationJobs(countryCode, locationGroup.locationId, { timeframeInWeeks });

      const allJobs = res.data.locationGroups.flatMap(group => group.jobPosts);
      setSelectedLocationJobs(allJobs);
    } catch (err) {
      console.error('Error loading location jobs:', err);
      setError(`Failed to load jobs for ${locationGroup.locationName}: ${err.message}`);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleCountryChange = (newCountryCode) => {
    setCountryCode(newCountryCode);
    setSelectedLocationJobs([]);
    setSelectedLocationName('');
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframeInWeeks(newTimeframe);
    setSelectedLocationJobs([]);
    setSelectedLocationName('');
  };

  const handleViewJob = (id) => {
    window.location.href = `/job-details/${id}`;
  };

  const renderSalary = (job) => {
    const currency = getCurrencySymbol(countryCode);
    if (job.salaryMin && job.salaryMax) {
      return `${currency}${formatCurrency(job.salaryMin)} - ${currency}${formatCurrency(job.salaryMax)}`;
    } else if (job.salaryMin) {
      return `${currency}${formatCurrency(job.salaryMin)}+`;
    } else if (job.salaryMax) {
      return `Up to ${currency}${formatCurrency(job.salaryMax)}`;
    }
    return null;
  };

  if (loadError) return <div className="job-map-error">Error loading Google Maps: {loadError.message}</div>;
  if (!isLoaded) return <div className="job-map-loading">Loading Google Maps...</div>;

  return (
    <div className="job-map-container">
      {/* Enhanced Controls */}
      <div className="job-map-controls">
        {/* Country Selection */}
        <div className="country-selector">
          {countries.map((code) => (
            <button
              key={code}
              onClick={() => handleCountryChange(code)}
              className={countryCode === code ? 'active' : ''}
              title={countryNames[code]}
            >
              <span className="flag-emoji">{getFlagEmoji(code)}</span>
              <span className="country-name">{countryNames[code]}</span>
            </button>
          ))}
        </div>

        {/* Timeframe Selection */}
        <div className="timeframe-selector">
          <label className="timeframe-label">Timeframe:</label>
          <div className="timeframe-buttons">
            {timeframeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTimeframeChange(option.value)}
                className={timeframeInWeeks === option.value ? 'active' : ''}
                title={`Show jobs from the last ${option.label.toLowerCase()}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="job-map-main">
        <div className="job-map-left">
          {loading ? (
            <div className="job-map-loading">Loading job locations...</div>
          ) : error ? (
            <div className="job-map-error">{error}</div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={defaultZooms[countryCode]}
              center={defaultCenters[countryCode]}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true
              }}
            >
              {locationGroups.map((group) => (
                group.latitude && group.longitude && (
                  <Marker
                    key={`location-${group.locationId}`}
                    position={{
                      lat: parseFloat(group.latitude),
                      lng: parseFloat(group.longitude)
                    }}
                    title={`${group.locationName} - ${group.jobCount} jobs`}
                    onClick={() => handleMarkerClick(group)}
                    icon={{
                      url: group.jobCount > 10 
                        ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNEQzI2MjYiLz4KPHRleHQgeD0iMTYiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiPjEwKzwvdGV4dD4KPC9zdmc+'
                        : group.jobCount > 5
                        ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTQiIGN5PSIxNCIgcj0iMTQiIGZpbGw9IiNGNTk3MzEiLz4KPHRleHQgeD0iMTQiIHk9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiPjUrPC90ZXh0Pgo8L3N2Zz4='
                        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiMzQjgyRjYiLz4KPHRleHQgeD0iMTIiIHk9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiPjEtNTwvdGV4dD4KPC9zdmc+',
                      scaledSize: new window.google.maps.Size(
                        group.jobCount > 10 ? 32 : group.jobCount > 5 ? 28 : 24,
                        group.jobCount > 10 ? 32 : group.jobCount > 5 ? 28 : 24
                      )
                    }}
                  />
                )
              ))}
            </GoogleMap>
          )}
        </div>

        <div className="job-map-right">
          <div className="job-map-header">
            <h3 className="job-map-heading">
              {selectedLocationName
                ? `${selectedLocationName} (${selectedLocationJobs.length} jobs)`
                : 'Click a location pin to view jobs'}
            </h3>
            {selectedLocationName && (
              <button 
                className="clear-selection-btn"
                onClick={() => {
                  setSelectedLocationJobs([]);
                  setSelectedLocationName('');
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>

          <div className="job-list-container">
            {loadingJobs ? (
              <div className="job-map-loading">Loading jobs...</div>
            ) : selectedLocationJobs.length > 0 ? (
              selectedLocationJobs.map((job) => (
                <div key={job.id} className="job-map-post-card">
                  <h4 className="job-map-post-title">{job.title}</h4>
                  
                  {job.companyName && (
                    <p className="job-map-post-company">🏢 {job.companyName}</p>
                  )}
                  
                  {job.locationName && (
                    <p className="job-map-post-location">📍 {job.locationName}</p>
                  )}
                  
                  {renderSalary(job) && (
                    <p className="job-map-post-salary">💰 {renderSalary(job)}</p>
                  )}
                  
                  {job.contractType && (
                    <p className="job-map-post-contract">📋 {job.contractType}</p>
                  )}
                  
                  {job.workLocation && (
                    <p className="job-map-post-work-location">🏠 {job.workLocation}</p>
                  )}
                  
                  {job.description && (
                    <p className="job-map-post-description">{job.description}</p>
                  )}
                  
                  {job.skills && job.skills.length > 0 && (
                    <div className="job-map-post-skills">
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="skill-tag more-skills">
                          +{job.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="job-map-post-actions">
                    <button 
                      className="view-job-btn"
                      onClick={() => handleViewJob(job.id)}
                    >
                      View Details →
                    </button>
                    <span className="job-date">
                      {new Date(job.created).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
              ))
            ) : selectedLocationName ? (
              <p className="job-map-empty">No jobs found for this location</p>
            ) : (
              <div className="job-map-empty">
                <p>Select a location on the map to view available jobs</p>
                <p className="total-locations">
                  📍 {locationGroups.length} locations with jobs in {countryNames[countryCode]}
                </p>
                <p className="timeframe-info">
                  Showing jobs from the last {timeframeInWeeks} week{timeframeInWeeks > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobMap;