import React from 'react';
import { Github, BookOpen, Figma, FileText } from 'lucide-react';

const Profile = () => {
  const profileData = {
    name: "Le Trung Hieu",
    id: "B22DCPT090",
    badges: ["Developer", "IoT"],
    resources: [
      {
        icon: <Github size={20} className="text-primary-600" />,
        title: "GitHub Repo",
        subtitle: "Source code",
        link: "https://github.com/hieu-kage/IOT-kicuoi",
        bgColor: "bg-primary-50"
      },
      {
        icon: <BookOpen size={20} className="text-purple-600" />,
        title: "API Swagger",
        subtitle: "Endpoints ref",
        link: "http://localhost:8000/docs#/",
        bgColor: "bg-purple-50"
      },
      {
        icon: <Figma size={20} className="text-indigo-600" />,
        title: "Figma Design",
        subtitle: "UI Prototypes",
        link: "https://www.figma.com/design/1lqQ51IguufoluC2BbzBCt/IOT?node-id=0-1&t=kLTqz2VaxSEuca1r-1",
        bgColor: "bg-indigo-50"
      },
      {
        icon: <FileText size={20} className="text-blue-600" />,
        title: "PDF Report",
        subtitle: "Documentation",
        link: "#",
        bgColor: "bg-blue-50"
      }
    ]
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl flex flex-col items-center p-6">
        {/* Avatar Section */}
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center">
            <img 
              src="/avatar.png" 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="text-4xl font-bold text-gray-300 hidden">LH</div>
          </div>
          <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-white shadow-sm"></div>
        </div>

        {/* User Info */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{profileData.name}</h2>
          <p className="text-gray-500 text-sm mb-6 font-medium tracking-wide">Student ID: {profileData.id}</p>
          <div className="flex items-center justify-center gap-3">
            {profileData.badges.map((badge, idx) => (
              <span 
                key={idx} 
                className="px-6 py-1.5 text-xs font-semibold rounded-full bg-[#F3E8FF] text-primary-700 transition-all hover:scale-105 shadow-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Project Resources Divider */}
        <div className="w-full flex items-center gap-4 mb-8">
          <div className="flex-1 h-[1px] bg-gray-100"></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Project Resources</span>
          <div className="flex-1 h-[1px] bg-gray-100"></div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {profileData.resources.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-primary-100 hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${item.bgColor} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-400 font-medium">{item.subtitle}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
