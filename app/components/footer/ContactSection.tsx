
const ContactSection = () => {
  return (
    <div className="bg-[#4169E1] text-white py-16 px-6 md:px-16">
      <div className="container mx-auto flex flex-col lg:flex-row justify-between gap-12">
        {/* Contact Information */}
        <div className="flex flex-col gap-8 lg:w-1/2">
          <div>
            <h6 className="text-yellow-400 text-sm mt-30">CONTACT US</h6>
            <h2 className="text-4xl font-bold leading-tight">
              GET IN TOUCH WITH US 
               ABOUT ANYTHING.
            </h2>
          </div>    

          <div className="space-y-6">
            <div>
              <p className="text-2sm opacity-80 mt-40">EMAIL ADDRESS</p>
              <p className="text-2xl mt-5">khanerdene2003@gmail.com</p>
            </div>

            <div>
              <p className="text-2sm opacity-80 mt-20">PHONE</p>
              <p className="text-2xl mt-5">+976-99200174</p>
            </div>

            <div>
              <p className="text-2sm opacity-80 mt-20">HEAD OFFICE</p>
              <p className="text-2xl mt-5 mb-30">NUM, МТЭС</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:w-1/2 mt-30 ">
          <div className="bg-white p-8 rounded-lg h-170">
            <form className="space-y-4 mt-10">
              <div>
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-black"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="E-mail"
                  className="w-full mt-5 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-black"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full mt-5 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-black"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Description"
                  rows={8}
                  className="w-full mt-5 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-black"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full mt-5 h-25 bg-gray-400 hover:bg-gray-500 text-white py-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
              >
                SEND
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;