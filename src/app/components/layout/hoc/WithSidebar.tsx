// hoc/WithSidebar.tsx
import React from 'react';
import AppSidebar from '../AppSidebar'

interface WithSidebarProps {
  children: React.ReactNode;
}

const WithSidebar = (Component: React.ComponentType) => {
  return function WithSidebarComponent(props: any) {
    return (
      <div className="flex h-screen overflow-hidden">
        <AppSidebar className="hidden md:flex border-r border-gray-200 dark:border-gray-700" />
        <div className="flex flex-col flex-1 overflow-x-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Component {...props} />
          </main>
        </div>
      </div>
    );
  };
};

export default WithSidebar;
