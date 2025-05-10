"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const steps = [
  {
    title: "Карт дизайн хийх",
    subtitle: "Эхний хуудсанд картны дизайнаа хийх юм.",
    image: "/help/step1.png",
  },
  {
    title: "Цахим нэрийн хуудас",
    subtitle: "Хуудас хоёрт цахим нэрийн хуудсаа хийх бөгөөд хэрэгтэй мэдээллээ оруулна.",
    image: "/help/step2.png",
  },
  {
    title: "Загвар хадгалах",
    subtitle: "Хийсэн картны болон цахим нэрийн хуудсаа хадгалахын тулд 'Загвар хадгалах' товчийг дарна.",
    image: "/help/step3.png",
  },
  {
    title: "Хадгалсан загварууд",
    subtitle: "Баруун талын цонхонд таны хадгалсан загварууд гарч ирнэ.",
    image: "/help/step4.png",
  },
  {
    title: "Захиалга баталгаажуулах",
    subtitle: "Хуудас гурав нь захиалгын хэсэг бөгөөд хүссэн картны болон цахим нэрийн хуудсаа сонгож, захиалгаа баталгаажуулна.",
    image: "/help/step5.png",
  },
];

const HelpButton = () => {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      close();
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const close = () => {
    setOpen(false);
    setStepIndex(0);
  };

  return (
    <>
<button
  onClick={() => setOpen(true)}
  className="flex items-center gap-3 border px-4 py-2 rounded-full text-base text-[#527ac9] hover:bg-blue-50 transition"
  style={{ borderColor: "#527ac9" }}
>
  <span
    className="w-6 h-6 flex items-center justify-center rounded-full text-white text-sm font-bold"
    style={{ backgroundColor: "#527ac9" }}
  >
    ?
  </span>
  Тусламж
</button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Header with close button */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Тусламж</h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={close}
              >
                <X size={24} />
              </button>
            </div>

            {/* Image container */}
            <div className="w-full h-64 relative bg-gray-100 flex justify-center items-center">
              <img
                src={steps[stepIndex].image}
                alt={`Алхам ${stepIndex + 1}`}
                className="max-h-full max-w-full p-2 object-contain"
              />
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200">
              <div
                className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
                style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Content section */}
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">Алхам {stepIndex + 1} / {steps.length}</h2>
                <h3 className="text-xl font-semibold mb-2">{steps[stepIndex].title}</h3>
                <p className="text-gray-600">{steps[stepIndex].subtitle}</p>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={prevStep}
                  className="px-6 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
                  disabled={stepIndex === 0}
                >
                  Өмнөх
                </button>
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  {stepIndex < steps.length - 1 ? "Дараагийн" : "Дуусгах"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpButton;