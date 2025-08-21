
import React from 'react';

const Header = () => {
  return (
    <header className="p-4 border-b border-gray-700">
      <div className="container mx-auto flex items-center">
        <h1 className="text-2xl font-bold text-white">
          SIFT Toolbox
        </h1>
        <span className="ml-3 text-gray-400">Software & Systems Analysis Assistant</span>
      </div>
    </header>
  );
};

export default Header;
