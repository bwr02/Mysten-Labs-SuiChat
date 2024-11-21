import { NavigationSidebar } from './components/NavigationSidebar.tsx';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0c1317]"> {/* Dark background color */}
      {/* Left Side Panel */}
        <NavigationSidebar />

      {/* Main Content Area */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}