import React from 'react';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-screen w-screen flex bg-background text-foreground overflow-hidden select-none">
      {/* Container holding Sidebar, ChatWindow, and ChatInfo */}
      <div className="flex flex-1 w-full h-full relative overflow-hidden">
        {children}
      </div>
    </div>
  );
};
