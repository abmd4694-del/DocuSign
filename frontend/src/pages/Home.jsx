import { Link } from 'react-router-dom';
import { FileText, Shield, Clock, CheckCircle } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Sign Documents
            <span className="text-primary-600"> Digitally</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Secure, fast, and legally binding electronic signatures. 
            Upload, sign, and share documents in minutes.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Get Started Free
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Upload</h3>
            <p className="text-gray-600 text-sm">
              Drag and drop your PDF documents for instant processing
            </p>
          </div>

          <div className="card text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure & Compliant</h3>
            <p className="text-gray-600 text-sm">
              Bank-level encryption and complete audit trails
            </p>
          </div>

          <div className="card text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Save Time</h3>
            <p className="text-gray-600 text-sm">
              Get documents signed in minutes, not days
            </p>
          </div>

          <div className="card text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Track Status</h3>
            <p className="text-gray-600 text-sm">
              Real-time updates on document signing status
            </p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            Perfect for Every Industry
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Business Contracts</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Vendor agreements</li>
                <li>• Client contracts</li>
                <li>• Partnership deals</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">HR & Onboarding</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Offer letters</li>
                <li>• NDA signing</li>
                <li>• Policy acknowledgements</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-3">Legal Documents</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Legal agreements</li>
                <li>• Compliance forms</li>
                <li>• Audit trails</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
