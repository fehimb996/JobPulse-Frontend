import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './RecentJobs.css';
import FavoriteButton from '@/components/FavoriteButton';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { fetchJobPosts, getCountries, getContractTypes, getContractTimes, getWorkLocations, getCompanies, getLocations, getSkills, getLanguages} from '@/api/api';
import ExportButton from '@/components/ExportButton';

const PAGE_SIZE = 10;

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

const getCurrencySymbol = (countryCode) => {
  switch (countryCode) {
    case 'GB': return '£';
    case 'CH': return 'CHF';
    case 'US': return '$';
    case 'NO': return 'NOK';
    case 'DK': return 'DKK'
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

const removeDiacritics = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export default function RecentJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingFilters, setLoadingFilters] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [message, setMessage] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    contractTypes: [],
    contractTimes: [],
    workLocations: [],
    companies: [],
    locations: [],
    skills: [],
    languages: [],
    countries: []
  });

  // Initialize state from URL parameters
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [timeframeInWeeks, setTimeframeInWeeks] = useState(Number(searchParams.get('timeframe')) || 1);
  const [contractType, setContractType] = useState(searchParams.get('contractType') || '');
  const [contractTime, setContractTime] = useState(searchParams.get('contractTime') || '');
  const [workLocation, setWorkLocation] = useState(searchParams.get('workLocation') || '');
  const [titleInput, setTitleInput] = useState(searchParams.get('title') || '');
  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [company, setCompany] = useState(searchParams.get('company') || '');
  const [skills, setSkills] = useState(searchParams.get('skills') ? searchParams.get('skills').split(',').filter(Boolean) : []);
  const [languages, setLanguages] = useState(searchParams.get('languages') ? searchParams.get('languages').split(',').filter(Boolean) : []);
  const [onlyFavorites, setOnlyFavorites] = useState(searchParams.get('favorites') === 'true');

  const [openSections, setOpenSections] = useState({
    time: true,
    country: true,
    workLocation: true,
    type: true,
    contractTime: true,
    languages: true,
    favorites: true,
    export: true
  });
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [searchTerms, setSearchTerms] = useState({
    company: searchParams.get('company') || '',
    location: searchParams.get('location') || '',
    skill: ''
  });
  const [focusedInputs, setFocusedInputs] = useState({
    company: false,
    location: false,
    skill: false
  });

  const companyRef = useRef(null);
  const locationRef = useRef(null);
  const skillRef = useRef(null);

  const countries = Object.keys(countryNames);

  // Function to update URL parameters
  const updateUrlParams = () => {
    const params = {};
    
    if (selectedCountry) params.country = selectedCountry;
    if (page > 1) params.page = page;
    if (timeframeInWeeks !== 1) params.timeframe = timeframeInWeeks;
    if (contractType) params.contractType = contractType;
    if (contractTime) params.contractTime = contractTime;
    if (workLocation) params.workLocation = workLocation;
    if (title) params.title = title;
    if (location) params.location = location;
    if (company) params.company = company;
    if (skills.length > 0) params.skills = skills.join(',');
    if (languages.length > 0) params.languages = languages.join(',');
    if (onlyFavorites) params.favorites = 'true';
    
    setSearchParams(params, { replace: true });
  };

  const resetPagination = () => setPage(1);

  const loadFilterData = async (type, params = {}) => {
    setLoadingFilters(prev => ({ ...prev, [type]: true }));
    try {
      let data;
      switch (type) {
        case 'countries':
          data = await getCountries();
          break;
        case 'contractTypes':
          data = await getContractTypes(params);
          break;
        case 'contractTimes':
          data = await getContractTimes(params);
          break;
        case 'workLocations':
          data = await getWorkLocations(params);
          break;
        case 'companies':
          data = await getCompanies(params);
          break;
        case 'locations':
          data = await getLocations(params);
          break;
        case 'skills':
          data = await getSkills(params);
          break;
        case 'languages':
          data = await getLanguages(params);
          break;
        default:
          return;
      }
      setFilterOptions(prev => ({ ...prev, [type]: data }));
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
    } finally {
      setLoadingFilters(prev => ({ ...prev, [type]: false }));
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    setData([]);
    
    try {
      const result = await fetchJobPosts({
        country: selectedCountry || null,
        page,
        pageSize: PAGE_SIZE,
        timeframeInWeeks,
        contractType,
        contractTime,
        workLocation,
        title,
        location,
        company,
        skills,
        languages,
        onlyFavorites
      });
      
      setData(result.jobs);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setFavoriteCount(result.favoriteCount || 0);
      setMessage(result.message);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Error loading jobs. Please try again.');
      setData([]);
      setTotalCount(0);
      setTotalPages(1);
      setMessage(null);
    } finally {
      setLoading(false);
    }
  };

  // Update URL whenever filters change
  useEffect(() => {
    updateUrlParams();
  }, [selectedCountry, page, timeframeInWeeks, contractType, contractTime, 
      workLocation, title, location, company, skills, languages, onlyFavorites]);

  useEffect(() => {
    ['countries', 'skills', 'contractTypes', 'companies', 'locations', 'contractTimes', 'workLocations', 'languages']
      .forEach(type => loadFilterData(type));
  }, []);

  useEffect(() => {
    const params = { countryCode: selectedCountry, timeframeInWeeks };
    ['contractTypes', 'contractTimes', 'workLocations', 'companies', 'locations', 'languages']
      .forEach(type => loadFilterData(type, params));
  }, [selectedCountry, timeframeInWeeks]);

  useEffect(() => {
    loadJobs();
  }, [selectedCountry, timeframeInWeeks, contractType, contractTime, workLocation, title, location, company, skills, languages, onlyFavorites, page]);

  useEffect(() => {
    resetPagination();
  }, [selectedCountry, timeframeInWeeks, contractType, contractTime, workLocation, title, location, company, skills, languages, onlyFavorites]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      [companyRef, locationRef, skillRef].forEach((ref, idx) => {
        const keys = ['company', 'location', 'skill'];
        if (ref.current && !ref.current.contains(event.target)) {
          setFocusedInputs(prev => ({ ...prev, [keys[idx]]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const setFocused = (input, value) => {
    setFocusedInputs(prev => ({ ...prev, [input]: value }));
  };

  const setSearchTerm = (input, value) => {
    setSearchTerms(prev => ({ ...prev, [input]: value }));
  };

  const getFiltered = (items, searchTerm) => {
    if (!searchTerm) return items;
    const normalized = removeDiacritics(searchTerm.toLowerCase());
    return items.filter(item =>
      removeDiacritics(item.toLowerCase()).includes(normalized)
    );
  };

  const handleSearch = () => {
    setTitle(titleInput);
  };

  const handleClearSearch = () => {
    setTitleInput('');
    setTitle('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSelect = (type, value) => {
    switch (type) {
      case 'company':
        setCompany(value);
        setSearchTerm('company', value);
        setFocused('company', false);
        break;
      case 'location':
        setLocation(value);
        setSearchTerm('location', value);
        setFocused('location', false);
        break;
      case 'skill':
        setSkills(prev => 
          prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
        );
        break;
    }
  };

  const toggleLanguage = (langName) => {
    setLanguages(prev =>
      prev.includes(langName) ? prev.filter(l => l !== langName) : [...prev, langName]
    );
  };

  const getActiveFilters = () => {
    const filters = [];
    filters.push({
      key: 'timeframe',
      label: `${timeframeInWeeks} week${timeframeInWeeks > 1 ? 's' : ''}`
    });

    const filterMap = [
      { key: 'country', value: selectedCountry, label: `${getFlagEmoji(selectedCountry)} ${countryNames[selectedCountry]}` },
      { key: 'title', value: title, label: `Title: ${title}` },
      { key: 'company', value: company, label: `Company: ${company}` },
      { key: 'location', value: location, label: `Location: ${location}` },
      { key: 'contractType', value: contractType, label: `Contract: ${contractType}` },
      { key: 'contractTime', value: contractTime, label: `Time: ${contractTime}` },
      { key: 'workLocation', value: workLocation, label: `Work: ${workLocation}` },
      { key: 'skills', value: skills.length, label: `Skills: ${skills.length === 1 ? skills[0] : `${skills.length} selected`}` },
      { key: 'languages', value: languages.length, label: `Languages: ${languages.length === 1 ? languages[0] : `${languages.length} selected`}` },
      { key: 'favorites', value: onlyFavorites, label: 'Favorites Only' }
    ];

    filterMap.forEach(filter => {
      if (filter.value) filters.push({ key: filter.key, label: filter.label });
    });

    return filters;
  };

  const clearFilter = (filterKey) => {
    const clearActions = {
      timeframe: () => setTimeframeInWeeks(1),
      country: () => {
        setSelectedCountry('');
        setLocation('');
        setSearchTerm('location', '');
        setCompany('');
        setSearchTerm('company', '');
      },
      title: () => {
        setTitle('');
        setTitleInput('');
      },
      company: () => {
        setCompany('');
        setSearchTerm('company', '');
      },
      location: () => {
        setLocation('');
        setSearchTerm('location', '');
      },
      contractType: () => setContractType(''),
      contractTime: () => setContractTime(''),
      workLocation: () => setWorkLocation(''),
      skills: () => {
        setSkills([]);
        setSearchTerm('skill', '');
      },
      languages: () => setLanguages([]),
      favorites: () => setOnlyFavorites(false)
    };

    clearActions[filterKey]?.();
  };

  const clearAllFilters = () => {
    setTimeframeInWeeks(1);
    setSelectedCountry('');
    setTitle('');
    setTitleInput('');
    setCompany('');
    setLocation('');
    setContractType('');
    setContractTime('');
    setWorkLocation('');
    setSkills([]);
    setLanguages([]);
    setOnlyFavorites(false);
    setSearchTerms({ company: '', location: '', skill: '' });
  };

  const isAnyFilterLoading = Object.values(loadingFilters).some(loading => loading);
  const displayedLanguages = showAllLanguages ? filterOptions.languages : filterOptions.languages.slice(0, 3);

  return (
    <div className="jobs-page">
      {/* Top Search Bar */}
      <div className="top-search-bar">
        {/* Title Search */}
        <div className="search-card">
          <div className="search-card-header">Title</div>
          <div className="search-input-group">
            <input
              className="search-input"
              type="text"
              placeholder="Search job title..."
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            {title ? (
              <button className="clear-button" onClick={handleClearSearch} title="Clear search">
                <X size={16} />
              </button>
            ) : (
              <button className="search-button" onClick={handleSearch} title="Search" disabled={!titleInput.trim()}>
                <Search size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Skills Search */}
        <div className="search-card" ref={skillRef}>
          <div className="search-card-header">
            Skills
            {loadingFilters.skills && <span className="loading-indicator">Loading...</span>}
          </div>
          <div className="autocomplete-container">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search skills..."
                className="search-input"
                value={searchTerms.skill}
                onChange={e => setSearchTerm('skill', e.target.value)}
                onFocus={() => setFocused('skill', true)}
                disabled={loadingFilters.skills}
              />
              {(searchTerms.skill || skills.length > 0) && (
                <button
                  className="clear-button"
                  onClick={() => {
                    setSearchTerm('skill', '');
                    if (skills.length > 0) setSkills([]);
                  }}
                  disabled={loadingFilters.skills}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {focusedInputs.skill && !loadingFilters.skills && (
              <div className="autocomplete-dropdown">
                <div className="dropdown-list scrollable-dropdown">
                  {getFiltered(filterOptions.skills, searchTerms.skill).map(skill => (
                    <button
                      key={skill}
                      className={`dropdown-item ${skills.includes(skill) ? 'active' : ''}`}
                      onClick={() => handleSelect('skill', skill)}
                    >
                      <span>{skill}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Company Search */}
        <div className={`search-card ${!selectedCountry ? 'disabled' : ''}`} ref={companyRef}>
          <div className="search-card-header">
            Company
            {loadingFilters.companies && <span className="loading-indicator">Loading...</span>}
          </div>
          <div className="autocomplete-container">
            <div className="search-input-group">
              <input
                type="text"
                placeholder={!selectedCountry ? "Select a country first..." : "Search company..."}
                className="search-input"
                value={searchTerms.company}
                onChange={(e) => setSearchTerm('company', e.target.value)}
                onFocus={() => selectedCountry && setFocused('company', true)}
                disabled={!selectedCountry || loadingFilters.companies}
              />
              {searchTerms.company && (
                <button
                  className="clear-button"
                  onClick={() => {
                    setSearchTerm('company', '');
                    setCompany('');
                  }}
                  disabled={!selectedCountry || loadingFilters.companies}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {focusedInputs.company && selectedCountry && !loadingFilters.companies && (
              <div className="autocomplete-dropdown">
                <div className="dropdown-list scrollable-dropdown">
                  {getFiltered(filterOptions.companies, searchTerms.company).map((companyName) => (
                    <button
                      key={companyName}
                      className={`dropdown-item ${company === companyName ? 'active' : ''}`}
                      onClick={() => handleSelect('company', companyName)}
                    >
                      <span>{companyName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Search */}
        <div className={`search-card ${!selectedCountry ? 'disabled' : ''}`} ref={locationRef}>
          <div className="search-card-header">
            Location
            {loadingFilters.locations && <span className="loading-indicator">Loading...</span>}
          </div>
          <div className="autocomplete-container">
            <div className="search-input-group">
              <input
                type="text"
                placeholder={!selectedCountry ? "Select a country first..." : "Search location..."}
                className="search-input"
                value={searchTerms.location}
                onChange={(e) => setSearchTerm('location', e.target.value)}
                onFocus={() => selectedCountry && setFocused('location', true)}
                disabled={!selectedCountry || loadingFilters.locations}
              />
              {searchTerms.location && (
                <button
                  className="clear-button"
                  onClick={() => {
                    setSearchTerm('location', '');
                    setLocation('');
                  }}
                  disabled={!selectedCountry || loadingFilters.locations}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {focusedInputs.location && selectedCountry && !loadingFilters.locations && (
              <div className="autocomplete-dropdown">
                <div className="dropdown-list scrollable-dropdown">
                  {getFiltered(filterOptions.locations, searchTerms.location).map((locationName) => (
                    <button
                      key={locationName}
                      className={`dropdown-item ${location === locationName ? 'active' : ''}`}
                      onClick={() => handleSelect('location', locationName)}
                    >
                      <span>{locationName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {getActiveFilters().length > 0 && (
          <div className="active-filters-section">
            <div className="active-filters-container">
              <div className="active-filters-list">
                {getActiveFilters().map((filter) => (
                  <div key={filter.key} className={`filter-indicator ${filter.key}`}>
                    <span className="filter-text">{filter.label}</span>
                    <button
                      className="filter-remove-btn"
                      onClick={() => clearFilter(filter.key)}
                      title="Remove filter"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <button className="reset-filters-btn" onClick={clearAllFilters} title="Clear all filters">
                Reset All
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="job-board-container">
        <aside className={`sidebar ${isAnyFilterLoading ? "loading" : ""}`}>
          {/* Timeframe Filter */}
          <div className="filter-card">
            <button className="filter-header" onClick={() => toggleSection('time')}>
              <span>Posted in</span>
              {openSections.time ? <ChevronUp /> : <ChevronDown />}
            </button>
            {openSections.time && (
              <div className="timeframe-buttons-wrapper">
                {[1, 2, 3, 4].map(week => (
                  <button
                    key={week}
                    onClick={() => setTimeframeInWeeks(week)}
                    className={`filter-button small ${timeframeInWeeks === week ? 'active' : ''}`}
                  >
                    {week === 1 ? 'This Week' : week === 2 ? 'Last Week' : `${week - 1} Weeks Ago`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Country Filter */}
          <div className="filter-card">
            <button className="filter-header" onClick={() => toggleSection('country')}>
              <span>Country</span>
              {openSections.country ? <ChevronUp /> : <ChevronDown />}
            </button>
            {openSections.country && (
              <div className="country-filter-wrapper">
                <button
                  onClick={() => {
                    setSelectedCountry('');
                    setLocation('');
                    setSearchTerm('location', '');
                    setCompany('');
                    setSearchTerm('company', '');
                  }}
                  className={`filter-button ${selectedCountry === '' ? 'active' : ''}`}
                >
                  <span>🌍 All Countries</span>
                  {selectedCountry === '' && (
                    <span className="count-badge">{loading ? '...' : totalCount}</span>
                  )}
                </button>
                {countries.map(code => (
                  <button
                    key={code}
                    onClick={() => {
                      setSelectedCountry(code);
                      setLocation('');
                      setSearchTerm('location', '');
                      setCompany('');
                      setSearchTerm('company', '');
                    }}
                    className={`filter-button ${selectedCountry === code ? 'active' : ''}`}
                  >
                    <span>{getFlagEmoji(code)} {countryNames[code]}</span>
                    {selectedCountry === code && (
                      <span className="count-badge">{loading ? '...' : totalCount}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Work Location */}
          <div className="filter-card">
            <button className="filter-header" onClick={() => toggleSection('workLocation')}>
              <span>Work Location</span>
              {openSections.workLocation ? <ChevronUp /> : <ChevronDown />}
            </button>
            {openSections.workLocation &&
              filterOptions.workLocations.map(loc => (
                <button
                  key={loc}
                  onClick={() => setWorkLocation(prev => prev === loc ? '' : loc)}
                  className={`filter-button ${workLocation === loc ? 'active' : ''}`}
                >
                  <span>{loc}</span>
                  {workLocation === loc && (
                    <span className="count-badge">{loading ? '...' : totalCount}</span>
                  )}
                </button>
              ))
            }
          </div>

          {/* Contract Time */}
          <div className="filter-card">
            <button className="filter-header" onClick={() => toggleSection('contractTime')}>
              <span>Type of Work</span>
              {openSections.contractTime ? <ChevronUp /> : <ChevronDown />}
            </button>
            {openSections.contractTime && (
              <div className="contract-filter-wrapper">
                {filterOptions.contractTimes.map(time => (
                  <button
                    key={time}
                    onClick={() => setContractTime(prev => prev === time ? '' : time)}
                    className={`filter-button ${contractTime === time ? 'active' : ''}`}
                  >
                    <span>{time}</span>
                    {contractTime === time && (
                      <span className="count-badge">{loading ? '...' : totalCount}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contract Type */}
          <div className="filter-card">
            <button className="filter-header" onClick={() => toggleSection('type')}>
              <span>Type of Contract</span>
              {openSections.type ? <ChevronUp /> : <ChevronDown />}
            </button>
            {openSections.type && (
              <div className="contract-filter-wrapper">
                {filterOptions.contractTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setContractType(prev => prev === type ? '' : type)}
                    className={`filter-button ${contractType === type ? 'active' : ''}`}
                  >
                    <span>{type}</span>
                    {contractType === type && (
                      <span className="count-badge">{loading ? '...' : totalCount}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Languages Filter */}
          <div className="filter-card export-filter-card">
            <button className="filter-header" onClick={() => toggleSection('languages')}>
              <span>Languages</span>
              {openSections.languages ? <ChevronUp /> : <ChevronDown />}
            </button>
            {openSections.languages && (
              <div className="scrollable-filter-area" style={{ padding: '8px 0' }}>
                {displayedLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className={`filter-button ${languages.includes(lang) ? 'active' : ''}`}
                  >
                    <span>{lang}</span>
                    {languages.includes(lang) && (
                      <span className="count-badge">{loading ? '...' : totalCount}</span>
                    )}
                  </button>
                ))}
                {filterOptions.languages.length > 3 && (
                  <button
                    className="load-more-button"
                    onClick={() => setShowAllLanguages(s => !s)}
                    style={{ marginTop: '8px' }}
                  >
                    {showAllLanguages ? 'Show Less' : `Load More (${filterOptions.languages.length - 3})`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Favorites Filter */}
          <div className="filter-card">
            <button className="filter-header" onClick={() => toggleSection('favorites')}>
              <span>Favorites</span>
              {openSections.favorites ? <ChevronUp /> : <ChevronDown />}
            </button>
            {openSections.favorites && (
              <div className="contract-filter-wrapper">
                <button
                  className={`filter-button ${onlyFavorites ? 'active' : ''}`}
                  onClick={() => setOnlyFavorites(prev => !prev)}
                >
                  <span>Favorite Posts</span>
                  {onlyFavorites && (
                    <span className="count-badge">{loading ? '...' : totalCount}</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Export Section */}
          <div className="filter-card export-filter-card">
            <button className="filter-header" onClick={() => toggleSection('export')}>
              <span>Export Data</span>
              {openSections.export ? <ChevronUp /> : <ChevronDown />}
            </button>
            {openSections.export && (
              <div style={{ padding: '8px 0' }}>
                <ExportButton
                  filters={{
                    country: selectedCountry,
                    timeframeInWeeks,
                    contractType,
                    contractTime,
                    workLocation,
                    title,
                    location,
                    company,
                    skills,
                    languages,
                    onlyFavorites
                  }}
                  totalCount={totalCount}
                />
                <div className="export-info">
                  Export all {totalCount.toLocaleString()} filtered job posts as JSON or CSV.
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Job Posts */}
        <main className="job-main">
          {message && <div className="info-banner">{message}</div>}

          <div className={`job-cards ${loading ? "loading" : "loaded"}`}>
            {data.map((job, idx) => (
              <div
                key={job.id || idx}
                className="job-card"
                onClick={(e) => {
                  if (e.button === 1 || e.button === 2) return;
                  window.location.href = `/job-details/${job.id}`;
                }}
              >
                <Link
                  to={`/job-details/${job.id}`}
                  className="job-title"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="job-title">{job.title}</h3>
                </Link>

                <div className="job-subtext">
                  <span>
                    🏢 <strong>{job.companyName}</strong><strong> ·</strong>📍{job.locationName}
                  </span>
                  <FavoriteButton Id={job.id} />
                </div>

                <div className="job-meta">
                  <span className="salary-badge">
                    {formatCurrency(job.salaryMin)}{getCurrencySymbol(selectedCountry)} – {formatCurrency(job.salaryMax)}{getCurrencySymbol(selectedCountry)}
                  </span>
                  <span className="job-date">
                    Posted on {new Date(job.created).toLocaleDateString('de-DE')}
                  </span>
                </div>

                {job.description && (
                  <p className="job-description">{job.description}</p>
                )}

                {(job.skills?.length > 0 || job.languages?.length > 0) && (
                  <div className="job-tags">
                    {job.skills?.slice(0, 5).map(skill => (
                      <span key={skill} className="tag skill-tag">{skill}</span>
                    ))}
                    {job.skills?.length > 5 && (
                      <span className="tag skill-tag more-skills">
                        +{job.skills.length - 5} more
                      </span>
                    )}
                    {job.languages?.slice(0, 3).map(lang => (
                      <span key={lang} className="tag language-tag">{lang}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading and Error States */}
            {loading && (
              <div className="loading-placeholder">
                <div className="loading-text"></div>
              </div>
            )}

            {error && !loading && (
              <div className="error-placeholder">
                <div className="error-text">{error}</div>
                <button className="retry-button" onClick={loadJobs}>
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && data.length === 0 && (
              <div className="no-results-placeholder">
                <div className="no-results-text"></div>
                <button className="clear-filters-button" onClick={clearAllFilters}>
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {data.length > 0 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                const isActive = page === p;
                if (
                  p === 1 ||
                  p === totalPages ||
                  (p >= page - 1 && p <= page + 1)
                ) {
                  return (
                    <button
                      key={p}
                      className={`pagination-button ${isActive ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                      disabled={loading}
                    >
                      {p}
                    </button>
                  );
                } else if (p === page - 2 || p === page + 2) {
                  return (
                    <span key={p} className="pagination-ellipsis">
                      …
                    </span>
                  );
                } else {
                  return null;
                }
              })}

              <button
                className="pagination-button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}