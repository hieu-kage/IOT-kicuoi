import React from 'react';
import { Github, BookOpen } from 'lucide-react';

const Profile = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-6">
      {/* Avatar */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          LH
        </div>
        <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
      </div>

      {/* Info */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Le Trung Hieu</h2>
        <p className="text-sm text-gray-400 mt-1">Student ID: B22DCPT090</p>
        <div className="flex items-center gap-2 justify-center mt-3">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">Developer</span>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">IoT</span>
        </div>
      </div>

      {/* Project Resources */}
      <div className="w-full max-w-sm">
        <p className="text-xs text-gray-400 text-center mb-3 font-medium tracking-wider uppercase">Project Resources</p>
        <div className="grid grid-cols-2 gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <Github size={18} className="text-primary-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700">GitHub Repo</p>
              <p className="text-xs text-gray-400">Source code</p>
            </div>
          </a>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <BookOpen size={18} className="text-primary-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700">API Swagger</p>
              <p className="text-xs text-gray-400">Endpoints ref</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Profile;
