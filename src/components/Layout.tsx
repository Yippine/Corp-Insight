import { Outlet } from 'react-router-dom';
import Header from './Header';
import SimpleFooter from './SimpleFooter';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center">
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
          <Outlet />
        </section>
      </main>
      <SimpleFooter />
    </div>
  );
}