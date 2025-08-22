import React from 'react';

interface CardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
      <div className="flex items-center space-x-3 px-6 py-4 bg-slate-800/75 border-b border-slate-700">
        {icon && <span className="text-blue-400">{icon}</span>}
        <h3 className="font-semibold text-slate-100">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
