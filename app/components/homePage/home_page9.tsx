"use client";

import { useState } from "react";
import { TbStarsFilled } from "react-icons/tb";
import { FaUserCircle } from "react-icons/fa";
import { FaStar, FaRegStar } from "react-icons/fa";

const reviews = [
  { id: 1, name: "Alice Johnson", rating: 5, comment: "Amazing service! Highly recommend." },
  { id: 2, name: "John Doe", rating: 4, comment: "Great experience, but delivery was slow." },
  { id: 3, name: "Emma Watson", rating: 5, comment: "Exceptional quality! Worth every penny." },
  { id: 4, name: "Liam Smith", rating: 3, comment: "Good, but could be improved." },
  { id: 5, name: "Sophia Lee", rating: 4, comment: "Nice product, will order again." },
  { id: 6, name: "Michael Brown", rating: 5, comment: "Best purchase ever, love it!" }
];

const HomePage9 = () => {
  const [index, setIndex] = useState(0);

  const nextSlide = () => setIndex((prev) => (prev + 1) % (reviews.length - 2));
  const prevSlide = () => setIndex((prev) => (prev - 1 + (reviews.length - 2)) % (reviews.length - 2));

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 w-full gap-16">
      {/* Top Section: Icon & Title */}
      <div className="flex flex-col items-center mt-10">
        <div className="flex items-center justify-center w-40 h-40 rounded-full bg-white border border-gray-500">
          <TbStarsFilled className="text-gray-700 text-8xl" />
        </div>
        <h1 className="text-5xl font-bold text-[#57697D] mt-3">What People Say About Us</h1>
      </div>

      {/* Reviews Section */}
      <div className="relative w-[80%] max-w-7xl overflow-hidden">
        {/* Review Cards */}
        <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${index * 33.33}%)` }}>
          {reviews.map((review) => (
            <div key={review.id} className="w-1/3 min-w-[33.33%] p-2">
              <div className="bg-white shadow-lg rounded-lg p-10 h-80 flex flex-col justify-start text-left">
                {/* Profile Icon & Name */}
                <div className="flex items-center gap-2">
                  <FaUserCircle className="text-gray-700 text-3xl" />
                  <h2 className="text-lg font-bold">{review.name}</h2>
                </div>

                {/* Star Rating */}
                <div className="flex pl-1">
                  {[...Array(5)].map((_, i) =>
                    i < review.rating ? <FaStar key={i} className="text-yellow-500" /> : <FaRegStar key={i} className="text-gray-400" />
                  )}
                </div>

                {/* Comment */}
                <p className="text-gray-600 mt-3">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-[0] top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-md transition-transform duration-200 active:scale-90"
        >
          {"<"}
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-[0] top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-md transition-transform duration-200 active:scale-90"
        >
          {">"}
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex space-x-3 mt-4 mb-10 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`w-5 h-5 rounded-full transition-all duration-300 ${index === i ? "bg-gray-700 scale-110" : "bg-gray-400"}`} />
        ))}
      </div>
    </div>
  );
};

export default HomePage9;
