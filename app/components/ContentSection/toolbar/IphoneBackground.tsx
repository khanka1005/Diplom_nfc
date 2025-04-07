"use client";

import React, { useState } from "react";

interface IphoneBackgroundProps {
  initialColor?: string;
  onColorChange: (color: string) => void;
}

const IphoneBackground: React.FC<IphoneBackgroundProps> = ({
  initialColor = "#fefdfd",
  onColorChange,
}) => {
  const [color, setColor] = useState(initialColor);

  const handleChange = (value: string) => {
    setColor(value);
    onColorChange(value);
  };

  return (
    <div className="space-y-2">
      
      <input
        type="color"
        value={color}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full h-10 p-1 border rounded-md"
      />
      <input
        type="text"
        value={color}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full border p-2 rounded-md"
        placeholder="#ffffff"
      />
    </div>
  );
};

export default IphoneBackground;
