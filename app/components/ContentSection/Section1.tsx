import Image from "next/image";

const Section1 = () => {
  return (
    <div className="flex border w-300 flex-col items-center justify-center bg-gray-100 py-10">
      {/* Title */}
      <h1 className="text-3xl font-bold py-4">Choose a Card Base</h1>

      {/* Main Layout: Left (Color Squares) | Right (Image) */}
      <div className="flex flex-wrap max-w-5xl gap-60 justify-center">
        {/* Left Side: 2x2 Colored Squares */}
        <div className="grid grid-cols-2 gap-10 flex-1">
          <div className="h-36 w-36 bg-red-500 rounded-lg shadow-md"></div>
          <div className="h-36 w-36 bg-blue-500 rounded-lg shadow-md"></div>
          <div className="h-36 w-36 bg-green-500 rounded-lg shadow-md"></div>
          <div className="h-36 w-36 bg-yellow-500 rounded-lg shadow-md"></div>
        </div>

        {/* Right Side: Image */}
        <div className="flex-1 flex justify-center items-center">
          <Image 
            src="/ImageCard.png" 
            alt="Card Base Image" 
            width={350} 
            height={450} 
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Section1;
