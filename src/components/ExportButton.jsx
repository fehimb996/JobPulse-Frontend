import React, { useState, useRef, useEffect } from 'react';
import { Download, Loader2, ChevronDown } from 'lucide-react';
import { exportJobPostsAsJson, exportJobPostsAsCsv } from '@/api/exportApi';

const ExportButton = ({ 
  filters, 
  totalCount, 
  className = '' 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExport = async (format = exportFormat) => {
    if (isExporting || totalCount === 0) return;
    
    setIsExporting(true);
    setShowDropdown(false);
    
    try {
      const exportFunction = format === 'csv' ? exportJobPostsAsCsv : exportJobPostsAsJson;
      const result = await exportFunction(filters);
      
      console.log(`Successfully exported ${totalCount} job posts to ${result.filename}`);
      
      // Optional: You can add a toast notification here if you have a toast system
      // toast.success(`Exported ${totalCount} jobs to ${result.filename}`);
      
    } catch (error) {
      console.error('Export failed:', error);
      
      // Show error message to user
      alert(`Failed to export job posts as ${format.toUpperCase()}. Please try again.`);
      
      // Optional: You can add a toast notification here if you have a toast system
      // toast.error(`Failed to export job posts as ${format.toUpperCase()}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFormatSelect = (format) => {
    setExportFormat(format);
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    if (!isExporting && totalCount > 0) {
      setShowDropdown(!showDropdown);
    }
  };

  return (
    <div className="export-button-container" ref={dropdownRef}>
      {/* Main Export Button */}
      <button
        onClick={() => handleExport()}
        disabled={isExporting || totalCount === 0}
        className={`export-button ${isExporting ? 'exporting' : ''} ${className}`}
        title={totalCount === 0 ? 'No jobs to export' : `Export ${totalCount} job posts as ${exportFormat.toUpperCase()}`}
      >
        {isExporting ? (
          <>
            <Loader2 size={16} className="spinning" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download size={16} />
            <span>Export {exportFormat.toUpperCase()}</span>
          </>
        )}
      </button>

      {/* Format Selector Dropdown */}
      <div className="export-dropdown">
        <button
          onClick={toggleDropdown}
          disabled={isExporting || totalCount === 0}
          className="export-dropdown-trigger"
          title="Choose export format"
        >
          <ChevronDown size={14} />
        </button>

        {showDropdown && (
          <div className="export-dropdown-menu">
            <button
              onClick={() => handleFormatSelect('csv')}
              className={`export-option ${exportFormat === 'csv' ? 'active' : ''}`}
            >
              <Download size={14} />
              CSV Format
            </button>
            <button
              onClick={() => handleFormatSelect('json')}
              className={`export-option ${exportFormat === 'json' ? 'active' : ''}`}
            >
              <Download size={14} />
              JSON Format
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportButton;