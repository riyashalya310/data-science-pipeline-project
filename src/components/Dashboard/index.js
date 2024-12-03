import React, { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useSelector } from "react-redux";
import { CiSquareRemove } from "react-icons/ci";
import { MdDashboard } from "react-icons/md";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Slicer from "./Slicer";
import Chart from "./Chart";
import TextBox from "./TextInput";
import "./index.css";

const Dashboard = (props) => {
  const files = useSelector((state) => state.user.files);
  const file = files.length > 0 ? files[files.length - 1] : null;
  const [elements, setElements] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState("#f9f9f9");
  const [animationClass, setAnimationClass] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);

  const [draggingType, setDraggingType] = useState(false); // Track the type being dragged
  const dashboardRef = useRef();

  // Function to add new elements
  const addElement = (type) => {
    const id = `element-${elements.length + 1}`;
    const newElement = {
      id,
      type,
      width: 300,
      height: 200,
      state: {}, // Placeholder for element-specific state
    };
    setElements([...elements, newElement]);
  };

  const updateElementState = (id, newState) => {
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id ? { ...el, state: { ...el.state, ...newState } } : el
      )
    );
  };

  // Function to remove elements by ID
  const removeElement = (id) => {
    setElements(elements.filter((el) => el.id !== id));
  };


  // Function to move elements within the dashboard
  const moveElement = (draggedId, droppedId) => {
    const draggedIndex = elements.findIndex((el) => el.id === draggedId);
    const droppedIndex = elements.findIndex((el) => el.id === droppedId);

    if (draggedIndex === -1 || droppedIndex === -1) return;

    const updatedElements = [...elements];
    const [movedElement] = updatedElements.splice(draggedIndex, 1);
    updatedElements.splice(droppedIndex, 0, movedElement);

    setElements(updatedElements);
  };

  // Function to update element size
  const updateElementSize = (id, newWidth, newHeight) => {
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id ? { ...el, width: newWidth, height: newHeight } : el
      )
    );
  };

  // Individual Element Component
  const Element = ({ id, type, state }) => {
    const element = elements.find((el) => el.id === id);
    const { width, height } = element;

    const [, drop] = useDrop({
      accept: "ELEMENT",
      hover: (item) => {
        if (item.id !== id) {
          moveElement(item.id, id);
        }
      },
    });

    const [, drag] = useDrag({
      type: "ELEMENT",
      item: () => {
        setDraggingType(type);
        return { id, type };
      },
      end: () => {
        setDraggingType(false);
      },
    });

    const handleResize = (e) => {
      e.preventDefault();
      const resizable = e.target.parentElement;
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = resizable.offsetWidth;
      const startHeight = resizable.offsetHeight;

      const onMouseMove = (e) => {
        const newWidth = startWidth + e.clientX - startX;
        const newHeight = startHeight + e.clientY - startY;
        if (newWidth > 150 && newHeight > 100) {
          updateElementSize(id, newWidth, newHeight);
        }
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const elementClass =
      type === "text"
        ? "text-element"
        : type === "slicer"
        ? "slicer-element"
        : "dashboard-element";

    return (
      <div
        ref={(node) => drag(drop(node))}
        className={elementClass}
        style={{
          width: type === "chart" ? `${width}px` : undefined,
          height: type === "chart" ? `${height}px` : undefined,
          opacity: draggingType ? (draggingType === "text" ? 0.5 : 1) : 1,
          position: "relative",
        }}
        key={id}
      >
        {type === "slicer" && (
          <Slicer
            file={file}
            state={state} // Pass the state to the Slicer
            onStateChange={(newState) => updateElementState(id, newState)} // Update state
            onRemove={() => removeElement(id)}
          />
        )}
        {type === "chart" && (
          <Chart file={file} onRemove={() => removeElement(id)} />
        )}
        {type === "text" && <TextBox onRemove={() => removeElement(id)} />}
        {type === "chart" && (
          <div className="resize-handle" onMouseDown={handleResize}></div>
        )}
      </div>
    );
  };

  // Function to navigate back to analysis module
  const prevBtnAnalysis = () => {
    const { history } = props;
    history.push("/analysis");
  };

  // Function to download dashboard as PDF
  const downloadPDF = () => {
    const input = dashboardRef.current;

    // Configure options for html2canvas to ensure proper scaling
    const canvasOptions = {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Ensure cross-origin images are included
      allowTaint: true,
      logging: true,
      backgroundColor: isNightMode ? "#000" : "#fff", // Match the night/light mode background
    };

    html2canvas(input, canvasOptions).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate the required scaling to fit the canvas into the PDF
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const scale = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);

      const scaledWidth = canvasWidth * scale;
      const scaledHeight = canvasHeight * scale;

      pdf.addImage(imgData, "PNG", 0, 0, scaledWidth, scaledHeight);

      pdf.save(`${file ? `${file.name}-dashboard` : "dashboard"}.pdf`);
    });
  };

  // Delete Area Component
  const DeleteArea = () => {
    const [isHovered, setIsHovered] = useState(false);

    const [, drop] = useDrop({
      accept: "ELEMENT",
      drop: (item) => {
        if (item.type === "text") {
          removeElement(item.id); // Only allow deletion for TextInput
        }
      },
      hover: (item, monitor) => {
        if (item.type === "text" && monitor.isOver({ shallow: true })) {
          setIsHovered(true);
        } else {
          setIsHovered(false);
        }
      },
      collect: (monitor) => {
        const isOver = monitor.isOver({ shallow: true });
        const canDrop = monitor.canDrop();
        return { isOver, canDrop };
      },
    });

    return (
      <div
        ref={drop}
        className={`delete-area ${isHovered ? "highlighted" : ""}`}
        style={{
          visibility: draggingType === "text" ? "visible" : "hidden",
          opacity: isHovered ? 1 : 0.5,
        }}
      >
        <CiSquareRemove /> Drag Text Here to Delete
      </div>
    );
  };

  return (
    <div
      className={`dashboard-container ${isNightMode ? "night-mode" : "light-mode"}`}
    >
      {/* Toolbar */}
      <div className="toolbar">
        <button onClick={() => addElement("slicer")}>Add Slicer</button>
        <button onClick={() => addElement("chart")}>Add Chart</button>
        <button onClick={() => addElement("text")}>Add Text Input</button>
        <button onClick={prevBtnAnalysis}>Back</button>
      </div>

      <button className="download-btn" onClick={downloadPDF}>
        Save <MdDashboard />
      </button>

      {/* Settings Icon */}
      <div className="settings-icon" onClick={() => setIsSettingsOpen(true)}>
        ⚙️
      </div>

      {/* Delete Area */}
      <DeleteArea />

      {/* Dashboard Space */}
      <div
        ref={dashboardRef}
        className={`dashboard-space ${animationClass}`}
        style={{ backgroundColor }}
      >
        {elements.map((el) => (
          <Element key={el.id} id={el.id} type={el.type} />
        ))}
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Prevent modal close on content click
          >
            <h4>Dashboard Settings</h4>
            <label>
              Background Color:
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </label>
            <label>
              Animation:
              <select
                value={animationClass}
                onChange={(e) => setAnimationClass(e.target.value)}
              >
                <option value="">None</option>
                <option value="fade-in">Fade In</option>
                <option value="slide-in">Slide In</option>
                <option value="zoom-in">Zoom In</option>
              </select>
            </label>
            <label>
              Night Mode
              <input
                type="checkbox"
                checked={isNightMode}
                onChange={() => setIsNightMode(!isNightMode)}
              />
            </label>
            <button
              className="close-btn"
              onClick={() => setIsSettingsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
