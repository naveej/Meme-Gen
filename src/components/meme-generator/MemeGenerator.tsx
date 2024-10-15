import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as Tabs from '@radix-ui/react-tabs';
import { saveAs } from 'file-saver';
import meme2 from '../../assets/aaq.jpg';

// Declare the global fabric object
declare global {
  interface Window {
    fabric: any;
  }
}

const MemeGenerator: React.FC = () => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedElement, setSelectedElement] = useState<fabric.Object | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const meme1 = "https://placehold.co/600x400/png";
  const templates = [meme1, meme2];

  useEffect(() => {
    const initCanvas = () => {
      if (containerRef.current && canvasRef.current && window.fabric) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const newCanvas = new window.fabric.Canvas(canvasRef.current, {
          width: containerWidth,
          height: containerHeight,
          backgroundColor: '#ffffff',
        });
        setCanvas(newCanvas);

        newCanvas.on('selection:created', (e: any) => setSelectedElement(e.selected[0]));
        newCanvas.on('selection:updated', (e: any) => setSelectedElement(e.selected[0]));
        newCanvas.on('selection:cleared', () => setSelectedElement(null));
      }
    };

    initCanvas();

    const handleResize = () => {
      if (canvas && containerRef.current) {
        canvas.setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
        canvas.renderAll();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        window.fabric.Image.fromURL(e.target?.result as string, (img: fabric.Image) => {
          img.scaleToWidth(canvas?.getWidth() || 600);
          canvas?.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        });
      };
      reader.readAsDataURL(file);
    },
  });

  const handleTemplateClick = (templateSrc: string) => {
    window.fabric.Image.fromURL(templateSrc, (img: fabric.Image) => {
      img.scaleToWidth(canvas?.getWidth() || 600);
      canvas?.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });
  };

  const addText = () => {
    if (canvas) {
      const text = new window.fabric.IText('New Text', {
        left: 50,
        top: 50,
        fontFamily: 'Arial',
        fill: 'white',
        fontSize: 40,
        editable: true,
        strokeWidth: 2,
        stroke: 'black',
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
    }
  };

  const downloadMeme = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
      });
      saveAs(dataURL, 'meme.png');
    }
  };

  const handleDeleteSelected = () => {
    if (canvas && selectedElement) {
      canvas.remove(selectedElement);
      setSelectedElement(null);
      canvas.renderAll();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="w-full md:w-1/4 p-4 bg-white shadow-md overflow-y-auto">
        <Tabs.Root defaultValue="templates">
          <Tabs.List className="flex mb-4">
            <Tabs.Trigger value="templates" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none">
              Templates
            </Tabs.Trigger>
            <Tabs.Trigger value="upload" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none">
              Upload
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="templates">
            <div className="grid grid-cols-2 gap-4">
              {templates.map((template, index) => (
                <img
                  key={index}
                  src={template}
                  alt={`Template ${index + 1}`}
                  className="w-full h-auto cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => handleTemplateClick(template)}
                />
              ))}
            </div>
          </Tabs.Content>
          <Tabs.Content value="upload">
            <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer">
              <input {...getInputProps()} />
              <p>Drag & drop an image here, or click to select one</p>
            </div>
          </Tabs.Content>
        </Tabs.Root>
        <button
          onClick={addText}
          className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Add Text
        </button>
        <button
          onClick={handleDeleteSelected}
          className="mt-2 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
        >
          Delete Selected
        </button>
        <button
          onClick={downloadMeme}
          className="mt-2 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
        >
          Download Meme
        </button>
      </div>
      <div className="flex-grow p-4" ref={containerRef}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default MemeGenerator;
