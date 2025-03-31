import { HiUserCircle, HiStar, HiCreditCard, HiShieldCheck, HiCash } from "react-icons/hi";
import { RiUserStarLine } from "react-icons/ri";

const HomePage2 = () => {
  return (
    <div className="min-h-screen flex flex-col items-center text-center px-6 py-12">
      {/* Top Section: Icon & Title */}
      <div className="flex flex-col items-center">
      <div className="flex items-center justify-center w-40 h-40 rounded-full bg-white border border-gray-500">
        <RiUserStarLine className="text-gray-700 text-8xl mb-4" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-8">NFC картыг сонгох шалтгаан</h1>
      </div>

      {/* Middle Section: Two Columns */}
      <div className="flex flex-wrap w-full max-w-6xl justify-between">
        {/* Left: Features List */}
        <div className="w-full md:w-1/2 max-w-lg flex flex-col gap-6 mx-auto">
          {[
            { icon: <HiStar className="text-gray-700 text-4xl" />, title: "Чанарын баталгаа", text: "Материалаас хамааран хамгийн багадаа 3 жилээс 10 жил хүртэл ашиглах боломжтой " },
            { icon: <HiCreditCard className="text-gray-700 text-4xl" />, title: "Хурдан хүргэлт", text: "Гэрээсээ яг одоо захилааад, хүргүүлээд ав" },
            { icon: <HiShieldCheck className="text-gray-700 text-4xl" />, title: "Аюулгүй", text: "Бид таны хувийн мэдээллийг хамгаалах болно" },
            { icon: <HiCash className="text-gray-700 text-4xl" />, title: "Нэрийн хуудсийг 5 секундэд", text: "NFC картаа ухаалаг утсанд ойртуулаад, цахим нэрийн хуудсаа түгээгээрэй" }
          ].map((feature, index) => (
            <div key={index} className="flex items-center bg-white p-4 rounded-lg shadow-md">
              <div className="mr-4">{feature.icon}</div>
              <div className="text-left">
                <h2 className="text-lg font-bold">{feature.title}</h2>
                <p className="text-gray-600">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Image with Left Padding */}
        <div className="w-full md:w-1/2 flex items-center justify-center mt-8 md:mt-0 pl-8 md:pl-5">
          <img src="/zurag2.png" alt="One Card" className="w-3/4 h-auto rounded-lg shadow-lg" />
        </div>
      </div>

      {/* Bottom Section: Three Squares with Icons & Text */}
      <div className="mt-12 flex flex-wrap justify-center gap-6">
  {[
    { icon: <HiStar className="text-gray-700 text-7xl" />, text: "Өндрөөр үнэлэгдсэн" },
    { icon: <HiShieldCheck className="text-gray-700 text-7xl" />, text: "Олны итгэлийг хүлээсэн" },
    { icon: <HiCreditCard className="text-gray-700 text-7xl" />, text: "Аюулгүй төлөх" }
  ].map((item, index) => (
    <div 
      key={index} 
      className="w-75 h-65 bg-white flex flex-col items-center justify-start rounded-lg shadow-md p-4 text-center"
    >
      {item.icon}
      <p className="text-sm font-semibold text-gray-700 mt-4 flex-grow break-words whitespace-normal line-clamp-3 max-h-24">
        {item.text}
      </p>
    </div>
  ))}
</div>

    </div>
  );
};

export default HomePage2;
