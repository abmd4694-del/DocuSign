import { User, Users } from 'lucide-react';

const SignModeSelector = ({ onSelectMode }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-center mb-8">Who will sign this document?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Only Me Option */}
        <div 
          onClick={() => onSelectMode('only-me')}
          className="cursor-pointer group relative p-6 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:shadow-lg transition-all text-center"
        >
          <div className="mb-4 flex justify-center">
            <div className="p-4 bg-blue-50 rounded-full group-hover:bg-red-50 transition-colors">
              <User className="w-12 h-12 text-blue-500 group-hover:text-red-500" />
            </div>
          </div>
          <button className="w-full py-2 px-4 rounded-md bg-red-600 text-white font-medium mb-3 hover:bg-red-700 transition-colors">
            Only me
          </button>
          <p className="text-sm text-gray-500">Sign this document</p>
        </div>

        {/* Several People Option */}
        <div 
          onClick={() => onSelectMode('several-people')}
          className="cursor-pointer group relative p-6 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:shadow-lg transition-all text-center"
        >
          <div className="mb-4 flex justify-center">
            <div className="p-4 bg-purple-50 rounded-full group-hover:bg-red-50 transition-colors">
              <Users className="w-12 h-12 text-purple-500 group-hover:text-red-500" />
            </div>
          </div>
          <button className="w-full py-2 px-4 rounded-md bg-red-600 text-white font-medium mb-3 hover:bg-red-700 transition-colors">
            Several people
          </button>
          <p className="text-sm text-gray-500">Invite others to sign</p>
        </div>
      </div>
    </div>
  );
};

export default SignModeSelector;
