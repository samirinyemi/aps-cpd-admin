import GlobalNav from './GlobalNav';
import GlobalCycleBar from './GlobalCycleBar';
import SideNavigation from './SideNavigation';
import Footer from './Footer';

export default function PageShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <GlobalNav />
      <GlobalCycleBar />
      <div className="flex flex-1">
        <SideNavigation />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 py-6">
            <div className="w-full max-w-[856px] mx-auto px-6">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
