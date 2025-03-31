const HomePage5 = () => {
    return (
        <div className="flex flex-col md:flex-row items-stretch">
          {/* Left Side:  */}
          
          <div className="w-full md:w-1/2 flex justify-center items-center">
    <img 
      src="/zurag5.png" 
      alt="Description" 
      className="w-full  max-h-[400px] object-cover"
    />
  </div>
          {/* Right Side:  */}
          <div className="w-full md:w-1/2 flex flex-col justify-center text-right p-8">
            <h1 className="text-5xl  font-bold text-gray-900 mb-4">Title </h1>
            <p className="text-lg text-gray-600 max-w-md self-end">
              This is a simple section with a title and some descriptive text. You can add more content here.
            </p>
          </div>
  
        </div>
      );
}
 
export default HomePage5;