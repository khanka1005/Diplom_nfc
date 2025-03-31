import HomePage1 from "../components/homePage/home_page1";
import HomePage2 from "../components/homePage/home_page2";
import HomePage3 from "../components/homePage/home_page3";
import HomePage4 from "../components/homePage/home_page4";
import HomePage5 from "../components/homePage/home_page5";
import HomePage6 from "../components/homePage/home_page6";
import HomePage7 from "../components/homePage/home_page7";
import HomePage8 from "../components/homePage/home_page8";
import HomePage9 from "../components/homePage/home_page9";


export default function HomePage() {
  return (
    <div >
      <div className="min-h-screen p-6">
      <HomePage1/>
      </div>
     <div className="bg-blue-50">
    <HomePage2/>
     </div>
     <div className="bg-[#DCE2EE] ">
    <HomePage3/>
     </div>
     <div className="bg-indigo-50">
<HomePage4/>
     </div>
     <HomePage5/>
     <HomePage6/>
     <HomePage7/>
     <div className="bg-[#E5E5E5]">
      <HomePage8/>
     </div>
     
     <div className="bg-[#DCE2EE]">
     <HomePage9/>
     </div>
    </div>
    
  );
}
