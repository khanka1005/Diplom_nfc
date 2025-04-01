"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import * as fabric from "fabric";

interface TemplatesProps {
  canvasRef: React.RefObject<fabric.Canvas | null>;
}

interface DesignData {
  id: string;
  designData: string;
  section: "section4";
  previewImage?: string;
}

const Templates: React.FC<TemplatesProps> = ({ canvasRef }) => {
  const [templates, setTemplates] = useState<DesignData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const templateSnapshot = await getDocs(collection(db, "templates"));
        const templateDocs = templateSnapshot.docs.map((doc) => ({
          id: doc.id,
          designData: doc.data().cardBase,
          section: "section4" as const,
          previewImage: doc.data().previewImage || "",
        }));
        setTemplates(templateDocs);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateClick = (template: DesignData) => {
    console.log("Applying Template:", template);

    if (!canvasRef.current) return;

    const targetCanvas = canvasRef.current;

    try {
      const parsedData = JSON.parse(template.designData);
      if (!parsedData || !parsedData.objects) {
        console.error("Invalid template data", parsedData);
        return;
      }

      // Clear existing canvas objects, keeping the background
      const backgroundRect = targetCanvas.getObjects().find((obj) => obj instanceof fabric.Rect && obj.fill === "#a8a6a6");

      targetCanvas.getObjects().forEach((obj) => {
        if (obj !== backgroundRect) {
          targetCanvas.remove(obj);
        }
      });

      // Load the template data onto the canvas
      targetCanvas.loadFromJSON(parsedData, () => {
        targetCanvas.renderAll();
      });

      console.log("Template applied successfully.");
    } catch (error) {
      console.error("Failed to load template data:", error);
    }
  };

  return (
    <div>
      {isLoading ? (
        <div className="text-gray-500">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-gray-500">No templates available.</div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="cursor-pointer border p-2 rounded-md transition-colors hover:bg-gray-200"
              onClick={() => handleTemplateClick(template)}
            >
              <div className="relative w-full h-24">
                {template.previewImage ? (
                  <img src={template.previewImage} alt="Template Preview" className="object-contain w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">No Preview</div>
                )}
              </div>
              <div className="mt-2 text-xs text-center truncate">Template {template.id.slice(0, 8)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Templates;
