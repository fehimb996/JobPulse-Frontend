import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchJobDetails } from '@/api/api';
import './JobDetails.css';

const countryNames = {
  US: 'USA',
  DE: 'Germany',
  GB: 'United Kingdom',
  NL: 'Netherlands',
  BE: 'Belgium',
  AT: 'Austria',
  CH: 'Switzerland',
  NO: 'Norway',
  DK: 'Denmark'
};

const getFlagEmoji = (countryCode) =>
  String.fromCodePoint(
    ...countryCode
      .toUpperCase()
      .split('')
      .map(c => 127397 + c.charCodeAt())
  );

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

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobDetails(id)
      .then(setJob)
      .catch(() => setError('Unable to load job details.'));
  }, [id]);

  if (error) return <p className="jd-error">{error}</p>;
  if (!job) return <p className="jd-loading">Loading…</p>;

  const {
    title,
    companyName,
    companyUrl,
    locationName,
    contractTime,
    contractType,
    workplaceModel,
    countryCode,
    countryName,
    salaryMin,
    salaryMax,
    fullDescription,
    description,
    created,
    url,
    skills,
    languages
  } = job;

  const currency = getCurrencySymbol(countryCode);
  const displayDesc = fullDescription || description;

  const formatContractType = (type) => {
    switch (type) {
      case 'permanent': return 'Permanent';
      case 'contract': return 'Contract';
      default: return type || '';
    }
  };

  const formatContractTime = (time) => {
    switch (time) {
      case 'full_time': return 'Full Time';
      case 'part_time': return 'Part Time';
      default: return time || '';
    }
  };

  return (
    <div className="job-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <header className="jd-header">
        <h1 className="jd-title">{title}</h1>
        {companyName && (
          <div className="jd-company">
            <strong>
              {companyUrl ? (
                <a href={companyUrl} target="_blank" rel="noopener noreferrer">{companyName}</a>
              ) : companyName}
            </strong>
          </div>
        )}
      </header>

      <section className="jd-meta">
        {locationName && <div><strong>Location:</strong> {locationName}</div>}
        {contractType && (
          <div><strong>Contract Type:</strong> {formatContractType(contractType)}</div>
        )}
        {contractTime && (
          <div><strong>Work Time:</strong> {formatContractTime(contractTime)}</div>
        )}
        {workplaceModel && (
          <div><strong>Work Location:</strong> {workplaceModel}</div>
        )}
        {countryCode && (
          <div>
            <strong>Country:</strong>&nbsp;
            <span className="jd-flag">{getFlagEmoji(countryCode)}</span>&nbsp;
            {countryNames[countryCode] || countryName}
          </div>
        )}
        {(salaryMin != null || salaryMax != null) && (
          <div>
            <strong>Salary:</strong>&nbsp;
            <span className='salary-badge'>
              {salaryMin?.toLocaleString()}{currency} – {salaryMax?.toLocaleString()}{currency}
            </span>
          </div>
        )}
        {created && (
          <div><strong>Posted:</strong> {new Date(created).toLocaleDateString('en-GB')}</div>
        )}
      </section>

      {displayDesc && (
        <section
          className="jd-description"
          dangerouslySetInnerHTML={{ __html: displayDesc }}
        />
      )}

      {(skills?.length || languages?.length) > 0 && (
        <section className="jd-tags">
          <h3>Skills & Languages</h3>
          <div className="jd-tag-container">
            {skills?.map(skill => (
              <span key={skill} className="tag skill-tag">{skill}</span>
            ))}
            {languages?.map(lang => (
              <span key={lang} className="tag language-tag">{lang}</span>
            ))}
          </div>
        </section>
      )}

      <a className="original-link" href={url} target="_blank" rel="noopener noreferrer">
        View Original Posting
      </a>
    </div>
  );
}
