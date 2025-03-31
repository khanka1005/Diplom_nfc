const HomePage3 = () => {
    return (
      <div className="flex flex-col md:flex-row items-stretch">
        {/* Left Side: Title & Text */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center p-8">
          <h1 className="text-5xl  font-bold text-gray-900 mb-4">Title </h1>
          <p className="text-lg text-gray-600 max-w-md">
            This is a simple section with a title and some descriptive text. You can add more content here.
          </p>
        </div>
  
        {/* Right Side: Image */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
  <img 
    src="/zurag3.png" 
    alt="Description" 
    className="w-full  max-h-[400px] object-cover"
  />
</div>

      </div>
    );
  };
  
  export default HomePage3;
  