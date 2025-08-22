
import React, { useState, useMemo } from 'react';
import { TableData, TableRow } from '../types';
import { ChevronsUpDown, ChevronUp, ChevronDown } from './Icons';

interface InteractiveTableProps {
  tableData: TableData;
}

type SortConfig = {
  key: string;
  direction: 'ascending' | 'descending';
} | null;

// Helper function to check if a string can be treated as a number
const isNumeric = (value: string): boolean => {
    // Check for rating formats like "4/5" or "4–5" and extract the first number
    const match = value.match(/^(\d+)/);
    if (match) {
        return !isNaN(parseFloat(match[1]));
    }
    return !isNaN(parseFloat(value)) && isFinite(Number(value));
};

const getNumericValue = (value: string): number => {
    const match = value.match(/^(\d+)/);
    if (match) {
        return parseFloat(match[1]);
    }
    return parseFloat(value);
};


const InteractiveTable: React.FC<InteractiveTableProps> = ({ tableData }) => {
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const filteredAndSortedRows = useMemo(() => {
    let filtered = [...tableData.rows];

    // Filtering
    if (filter) {
      const lowercasedFilter = filter.toLowerCase();
      filtered = filtered.filter(row =>
        Object.values(row).some(cell =>
          String(cell).toLowerCase().includes(lowercasedFilter)
        )
      );
    }

    // Sorting
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        const aIsNumeric = isNumeric(aValue);
        const bIsNumeric = isNumeric(bValue);

        if (aIsNumeric && bIsNumeric) {
            const aNum = getNumericValue(aValue);
            const bNum = getNumericValue(bValue);
            if (aNum < bNum) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aNum > bNum) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        }

        // Fallback to string comparison
        return aValue.localeCompare(bValue, undefined, { numeric: true }) * (sortConfig.direction === 'ascending' ? 1 : -1);
      });
    }

    return filtered;
  }, [tableData.rows, filter, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronsUpDown className="h-4 w-4 ml-2 text-slate-500" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ChevronUp className="h-4 w-4 ml-2" />;
    }
    return <ChevronDown className="h-4 w-4 ml-2" />;
  };

  return (
    <div className="not-prose my-6">
      <div className="mb-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Filter ${tableData.rows.length} items...`}
          className="w-full max-w-sm bg-slate-800/50 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-0 transition-colors"
        />
      </div>
      <div className="overflow-x-auto border border-slate-700 rounded-lg">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="bg-slate-800/75 text-xs text-slate-300 uppercase">
            <tr>
              {tableData.headers.map((header) => (
                <th key={header} scope="col" className="px-4 py-3">
                  <button
                    onClick={() => requestSort(header)}
                    className="flex items-center w-full text-left font-semibold"
                  >
                    {header}
                    {getSortIcon(header)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/50">
                {tableData.headers.map((header, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 align-top">
                     {/* Use pre-wrap to respect newlines but wrap long lines */}
                    <span className="whitespace-pre-wrap">{row[header]}</span>
                  </td>
                ))}
              </tr>
            ))}
             {filteredAndSortedRows.length === 0 && (
                <tr>
                    <td colSpan={tableData.headers.length} className="text-center py-8 text-slate-500">
                        No results found.
                    </td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InteractiveTable;
