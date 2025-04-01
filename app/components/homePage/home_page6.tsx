import { RiFolderVideoLine } from "react-icons/ri";

const HomePage6 = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-8 w-full">
          
          {/* Full-width Colored Line ABOVE the Icon */}
          <div className="w-screen h-1 bg-[#85A0BF]"></div>

          {/* Top Section: Icon in a Circle & Title */}
          <div className="flex flex-col items-center mt-30">
            <div className="flex items-center justify-center w-40 h-40 rounded-full bg-white border border-gray-500">
              <RiFolderVideoLine className="text-gray-700 text-8xl" />
            </div>
            <h1 className="text-5xl font-bold text-[#57697D] mt-3">Video Explainer</h1>
          </div>

          {/* Centered Video */}
          <video 
             src={undefined}
            controls
            className="w-full max-w-4xl rounded-lg shadow-lg mt-7 mb-20"
          />
        </div>
    );
}

export default HomePage6;
