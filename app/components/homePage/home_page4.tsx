import { FaPen } from "react-icons/fa6";
import { SiAntdesign } from "react-icons/si";
import { TbHandClick } from "react-icons/tb";
import { TiDocumentText } from "react-icons/ti";
const HomePage4 = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8">
      {/* Top Section: Icon in a Circle & Title */}
      <div className="flex flex-col items-center mt-5">
      <div className="flex items-center justify-center w-40 h-40 rounded-full bg-white border border-gray-500">
          <SiAntdesign className="text-gray-700 text-8xl" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mt-6">Multiple Design</h1>
      </div>

      {/* Centered Image (Replace with your actual image) */}
      <img
        src="/zurag4.png" 
        
        className="w-200 h-150 object-cover rounded-lg mt-5"
      />

      {/* Bottom Section: 3 Circular Icons */}
      <div className="flex space-x-6 mt-5 gap-6 mb-25">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#85A0BF]">
          <TbHandClick className="text-white text-4xl" />
        </div>
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#85A0BF]">
          <FaPen className="text-white text-4xl" />
        </div>
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#85A0BF]">
          <TiDocumentText className="text-white text-4xl" />
        </div>
      </div>
    </div>
  );
};

export default HomePage4;
