import React from 'react';

interface SkeletonTableProps {
  columns: number;
  rows?: number;
}

const SkeletonTable: React.FC<SkeletonTableProps> = ({ columns, rows = 5 }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200 animate-pulse">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="px-6 py-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <tr key={rowIdx}>
            {Array.from({ length: columns }).map((_, colIdx) => (
              <td key={colIdx} className="px-6 py-4">
                <div className="h-4 bg-gray-100 rounded w-full" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SkeletonTable; 