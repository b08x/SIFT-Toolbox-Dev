import React from 'react';

const Header = () => {
  return (
    <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/75 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto flex items-center">
        <h1 className="text-xl font-semibold text-slate-100">
          SIFT Toolbox
        </h1>
        <span className="ml-3 text-slate-500 text-sm hidden sm:inline">Software & Systems Analysis Assistant</span>
      </div>
    </header>
  );
};

export default Header;