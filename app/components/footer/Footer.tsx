import { FaFacebook } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import { FaTwitterSquare } from "react-icons/fa";
import ContactSection from "./ContactSection";
const Footer = () => {
    return (
        <div>
<ContactSection/>
        
      <footer className="bg-[#040b2f] text-white py-10 px-6 md:px-16">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
          {/* Logo Section */}
          <div className="mb-6 md:mb-0">
          <img src="/num_logo.png" alt="Company Logo" className="w-24 h-24" />
          </div>
  
          {/* Social Icons with "Follow us on" text */}
          <div className="flex flex-col md:flex-row items-center gap-4 mt-6 md:mt-0">
            <span className="text-2sm">Follow us on</span>
            <div className="flex gap-4">
              <a href="#" className="text-2xl hover:text-gray-400" aria-label="Facebook">
                <FaFacebook className="text-5xl text-gray-700" />
              </a>
              <a href="#" className="text-2xl hover:text-gray-400" aria-label="Instagram"> <FaSquareInstagram className="text-5xl text-gray-700" /></a>
              <a href="#" className="text-2xl hover:text-gray-400" aria-label="Twitter">
              <FaTwitterSquare className="text-5xl text-gray-700" />
              </a>
              <a href="#" className="text-2xl hover:text-gray-400" aria-label="YouTube">
              <FaYoutube className="text-5xl text-gray-700" />
              </a>
            </div>
          </div>
        </div>
  
        {/* Horizontal Line */}
        <div className="border-t border-gray-600 w-[80%] mx-auto my-6"></div>
  
        {/* Copyright and Navigation Links */}
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm mb-7">
          <p className="mb-4 text-xl md:mb-0">Copyright by </p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline text-xl">Home</a>
            <a href="#" className="hover:underline text-xl">FAQ</a>
            <a href="#" className="hover:underline text-xl">About us</a>
            <a href="#" className="hover:underline text-xl">Contact us</a>
          </div>
        </div>
      </footer>
      </div>
    );
  };
  
  export default Footer;