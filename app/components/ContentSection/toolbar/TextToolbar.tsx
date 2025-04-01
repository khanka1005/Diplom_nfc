"use client";

import React, { useState, useEffect } from "react";
import * as fabric from "fabric";

interface TextToolbarProps {
  canvasRef: React.RefObject<fabric.Canvas | null>;
}

const TextToolbar: React.FC<TextToolbarProps> = ({ canvasRef }) => {
  const [selectedText, setSelectedText] = useState<fabric.Text | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  // Detect selected text object
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleSelection = () => {
        const activeObject = canvas.getActiveObject();
        if (activeObject && (activeObject.type === "text" || activeObject.type === "textbox")) {
          const textObject = activeObject as fabric.Text;
          setSelectedText(textObject);
          setFontSize(textObject.fontSize || 24);
          setFontColor(textObject.fill?.toString() || "#000000");
          setFontFamily(textObject.fontFamily || "Arial");
          setIsBold(textObject.fontWeight === "bold");
          setIsItalic(textObject.fontStyle === "italic");
        } else {
          setSelectedText(null);
        }
      };
      

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => setSelectedText(null));

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", () => setSelectedText(null));
    };
  }, [canvasRef]);

  const updateText = (updates: Partial<fabric.Text>) => {
    if (!selectedText || !canvasRef.current) return;
    selectedText.set(updates);
    canvasRef.current.renderAll();
  };

  // Add Text to Canvas
  const addTextToCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
  
    const newText = new fabric.Textbox("New Text", {
      left: 100,
      top: 100,
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#000000",
      selectable: true,
      hasControls: true,
    });
  
    // Add text to canvas
    canvas.add(newText);
  
    // Select and activate the new text
    canvas.setActiveObject(newText);
    canvas.renderAll();
  
    // Trigger selection manually
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.type === "text" || activeObject.type === "textbox")) {
      const textObject = activeObject as fabric.Text;
      setSelectedText(textObject);
      setFontSize(textObject.fontSize || 24);
      setFontColor(textObject.fill?.toString() || "#000000");
      setFontFamily(textObject.fontFamily || "Arial");
      setIsBold(textObject.fontWeight === "bold");
      setIsItalic(textObject.fontStyle === "italic");
    }
  };
  
  

  // Delete Selected Text
  const deleteSelectedText = () => {
    if (!canvasRef.current || !selectedText) return;
    const canvas = canvasRef.current;

    canvas.remove(selectedText);
    setSelectedText(null);
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  return (
    <div className="p-4 bg-white border rounded-lg">
      <h3 className="text-lg font-bold mb-4">🖋️ Text Settings</h3>

      {/* Add and Delete Buttons */}
      <div className="mb-2">
        <button
          onClick={addTextToCanvas}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-40"
        >
          ➕ Add Text
        </button>

        {selectedText && (
          <button
            onClick={deleteSelectedText}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-40"
          >
            🗑️ Delete Text
          </button>
        )}
      </div>

      {selectedText ? (
        <>
          {/* Font Size */}
          <div className="mb-4">
            <label>Font Size: </label>
            <input
              type="number"
              min="10"
              max="150"
              value={fontSize}
              onChange={(e) => {
                setFontSize(Number(e.target.value));
                updateText({ fontSize: Number(e.target.value) });
              }}
              className="border p-2 ml-2"
            />
          </div>

          {/* Font Family */}
          <div className="mb-4">
            <label>Font Family: </label>
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                updateText({ fontFamily: e.target.value });
              }}
              className="border p-2 ml-2"
            >
              <option value="Arial">Arial</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Verdana">Verdana</option>
            </select>
          </div>

          {/* Font Color */}
          <div className="mb-4">
            <label>Font Color: </label>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => {
                setFontColor(e.target.value);
                updateText({ fill: e.target.value });
              }}
              className="ml-2"
            />
          </div>

          {/* Bold and Italic */}
          <div className="mb-4">
            <button
              className={`mr-2 p-2 rounded ${isBold ? "bg-gray-300" : "bg-white border"}`}
              onClick={() => {
                setIsBold(!isBold);
                updateText({ fontWeight: isBold ? "normal" : "bold" });
              }}
            >
              B
            </button>

            <button
              className={`p-2 rounded ${isItalic ? "bg-gray-300" : "bg-white border"}`}
              onClick={() => {
                setIsItalic(!isItalic);
                updateText({ fontStyle: isItalic ? "normal" : "italic" });
              }}
            >
              I
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">No text selected</p>
      )}
    </div>
  );
};

export default TextToolbar;


