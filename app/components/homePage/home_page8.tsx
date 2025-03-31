import { IoSettingsOutline } from "react-icons/io5";

const HomePage8 = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-8 w-full">
            {/* Top Section: Icon in a Circle & Title */}
            <div className="flex flex-col items-center mt-30">
                <div className="flex items-center justify-center w-40 h-40 rounded-full bg-white border border-gray-500">
                    <IoSettingsOutline className="text-gray-700 text-8xl" />
                </div>
                <h1 className="text-5xl font-bold text-[#57697D] mt-3">How it works</h1>
            </div>

            {/* Three Steps Section */}
            <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-8 w-full relative gap-25 mb-30">
                {/* Step 1 */}
                <div className="flex flex-col items-center relative">
                    {/* Circle with Number */}
                    <div className="w-16 h-16 rounded-full bg-[#ffffff] flex items-center justify-center text-[#57697D] text-2xl font-bold">
                        1
                    </div>
                    {/* Horizontal Line */}
                    <div className="w-75 h-2 bg-[#C4C4C4] absolute top-8 left-1/2 transform -translate-x-1 ml-9"></div>
                    {/* Square Container */}
                    <div className="w-65 h-80 border-rounded bg-[#FFFFFF] flex flex-col items-center justify-start mt-20">
                        <p className="text-xl text-[#57697D] text-center mt-4">Commander votre carte</p>
                        {/* Image Placeholder */}
                        <div className="mt-17 w-45 h-32 bg-gray-300 flex items-center justify-center">
                            <img src="/card.jpg"  className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* Vertical Line */}
                

                {/* Step 2 */}
                <div className="flex flex-col items-center relative">
                    {/* Circle with Number */}
                    <div className="w-16 h-16 rounded-full bg-[#ffffff] flex items-center justify-center text-[#57697D] text-2xl font-bold">
                        2
                    </div>
                    {/* Horizontal Line */}
                    <div className="w-81  h-2 bg-[#C4C4C4] absolute top-8 left-1/2 transform -translate-x-1 ml-9"></div>
                    {/* Square Container */}
                    <div className="w-65 h-80 border-rounded bg-[#FFFFFF] flex flex-col items-center justify-start mt-20">
                        <p className="text-xl text-[#C4C4C4] text-center mt-4">Commander votre carte</p>
                        {/* Image Placeholder */}
                        <div className="mt-17 w-50 h-32 bg-white flex items-center justify-center">
                            <img src="ImageCard.png" alt="Step 2" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* Vertical Line */}
                

                {/* Step 3 */}
                <div className="flex flex-col items-center relative">
                    {/* Circle with Number */}
                    <div className="w-16 h-16 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#57697D] text-2xl font-bold">
                        3
                    </div>
                    
                    {/* Square Container */}
                    <div className="w-65 h-80 border-rounded bg-[#FFFFFF] flex flex-col items-center justify-start mt-20">
                        <p className="text-xl text-[#57697D] text-center mt-4">Commander votre carte</p>
                        {/* Image Placeholder */}
                        <div className="mt-10 w-32 h-50 bg-white flex items-center justify-center">
                            <img src="IphoneWeb.png" alt="Step 3" className="w-full h-full object-contain" />
                        </div>
                    </div>
                    
                </div>
                
            </div>
        </div>
    );
};

export default HomePage8;
