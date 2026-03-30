import { Link } from "react-router-dom";
import { ArrowRight, QrCode, ShieldCheck, MapPin, BarChart3, Clock, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const Index = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#f7f5ff] text-[#232c51] font-sans selection:bg-[#0058ba] selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-[#ffffff]/70 backdrop-blur-xl border-b border-[#efefff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0058ba] to-[#6c9fff] shadow-[0_4px_24px_-4px_rgba(0,88,186,0.25)]">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Smart Attendance Hub
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="font-semibold text-sm px-6 py-2.5 rounded-lg bg-gradient-to-br from-[#0058ba] to-[#6c9fff] text-white shadow-[0_8px_32px_-4px_rgba(35,44,81,0.15)] hover:shadow-[0_8px_32px_-4px_rgba(35,44,81,0.25)] transition-all duration-300"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="font-semibold text-[#0058ba] text-sm px-4 py-2 hover:bg-[#efefff] rounded-lg transition-colors"
                  >
                    Teacher Portal
                  </Link>
                  <Link
                    to="/login"
                    className="font-semibold text-sm px-6 py-2.5 rounded-lg bg-gradient-to-br from-[#0058ba] to-[#6c9fff] text-white shadow-[0_8px_32px_-4px_rgba(35,44,81,0.15)] hover:shadow-[0_8px_32px_-4px_rgba(35,44,81,0.25)] transition-all duration-300"
                  >
                    Student Login →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#232c51] mb-8"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Streamline Your <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0058ba] to-[#6c9fff]">
              Campus Attendance
            </span>
          </h1>
          <p className="mt-6 text-xl text-[#505a81] max-w-2xl mx-auto leading-relaxed">
            Smart, secure, and simple. Eliminate manual roll calls with our atmospheric, frictionless attendance ecosystem powered by real-time analytics.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold text-base px-8 py-4 rounded-xl bg-gradient-to-br from-[#0058ba] to-[#6c9fff] text-white shadow-[0_16px_48px_-8px_rgba(0,88,186,0.35)] hover:scale-[1.02] hover:shadow-[0_24px_56px_-8px_rgba(0,88,186,0.45)] transition-all duration-300"
            >
              Get Started Now <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 font-semibold text-[#505a81] text-base px-8 py-4 rounded-xl border border-[#a2abd7]/30 hover:bg-[#efefff] transition-colors duration-300"
            >
              Explore Features
            </a>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#ffffff] relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a2abd7]/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[#232c51] sm:text-4xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Built for Modern Institutions
            </h2>
            <p className="mt-4 flex justify-center text-lg text-[#505a81]">
              Everything you need to manage classrooms efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#f7f5ff] rounded-[1.5rem] p-8 transition-transform duration-300 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-[#ffffff] flex items-center justify-center shadow-sm mb-6">
                <QrCode className="h-6 w-6 text-[#0058ba]" />
              </div>
              <h3 className="text-xl font-bold text-[#232c51] mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>QR Scanning</h3>
              <p className="text-[#505a81] leading-relaxed">
                Generate dynamic QR codes for secure, time-sensitive student check-ins during lectures.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#f7f5ff] rounded-[1.5rem] p-8 transition-transform duration-300 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-[#ffffff] flex items-center justify-center shadow-sm mb-6">
                <MapPin className="h-6 w-6 text-[#0058ba]" />
              </div>
              <h3 className="text-xl font-bold text-[#232c51] mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>Geofencing</h3>
              <p className="text-[#505a81] leading-relaxed">
                Ensure students are physically present in the classroom using precise location boundaries.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#f7f5ff] rounded-[1.5rem] p-8 transition-transform duration-300 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-[#ffffff] flex items-center justify-center shadow-sm mb-6">
                <BarChart3 className="h-6 w-6 text-[#0058ba]" />
              </div>
              <h3 className="text-xl font-bold text-[#232c51] mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>Real-time Reports</h3>
              <p className="text-[#505a81] leading-relaxed">
                Access deep analytics and exportable insights on student attendance patterns instantly.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#f7f5ff] rounded-[1.5rem] p-8 transition-transform duration-300 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-[#ffffff] flex items-center justify-center shadow-sm mb-6">
                <ShieldCheck className="h-6 w-6 text-[#0058ba]" />
              </div>
              <h3 className="text-xl font-bold text-[#232c51] mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>Secure Auth</h3>
              <p className="text-[#505a81] leading-relaxed">
                Enterprise-grade security preventing proxy attendance and unauthorized access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-[#f7f5ff] py-12 border-t border-[#efefff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle2 className="h-4 w-4 text-[#006669]" />
            <span className="text-[#505a81] text-sm">System Fully Operational</span>
          </div>
          <p className="text-[#505a81] text-sm">
            &copy; {new Date().getFullYear()} Smart Attendance Hub. Designed with the Lumina system.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
