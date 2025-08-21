
import React from 'react';

export const SparklesIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9.93 13.5A2.25 2.25 0 0 0 7.5 12a2.25 2.25 0 0 0-2.43 1.5" />
    <path d="M12 3v2" />
    <path d="M21 12h-2" />
    <path d="M3 12H1" />
    <path d="m19.07 4.93-.4.4" />
    <path d="m5.33 18.67-.4.4" />
    <path d="m19.47 18.67-.4-.4" />
    <path d="m5.73 4.93-.4-.4" />
    <path d="M12 21v-2" />
    <path d="M14.07 13.5A2.25 2.25 0 0 0 16.5 12a2.25 2.25 0 0 0 2.43 1.5" />
    <path d="M18 16.5a2.25 2.25 0 0 0-1.5-2.43" />
    <path d="M6 16.5a2.25 2.25 0 0 1 1.5-2.43" />
  </svg>
);

export const AlertTriangleIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
);

export const GitBranchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="6" x2="6" y1="3" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </svg>
);
