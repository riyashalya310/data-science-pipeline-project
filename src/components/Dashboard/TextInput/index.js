import React, { useState } from "react";

const TextBox = ({ onRemove }) => {
  const [text, setText] = useState("Your text here...");
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [shape, setShape] = useState("square");
  const [borderRadius, setBorderRadius] = useState(50); // Default for circle
  const [margin, setMargin] = useState(10);
  const [padding, setPadding] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleInput = (e) => {
    const currentText = e.currentTarget.textContent;
    setText(currentText);

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(e.currentTarget);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  return (
    <div
      className="text-box-container"
      onMouseEnter={toggleModal}
      onMouseLeave={toggleModal}
      style={{
        backgroundColor,
        borderRadius: shape === "circle" ? `${borderRadius}%` : shape === "rounded" ? "16px" : "0",
        margin: `${margin}px`,
        padding: `${padding}px`,
      }}
    >
      {isModalVisible && (
        <div className="text-box-modal">
          <div className="option-group">
            <label>Font Size:</label>
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              min="10"
              max="50"
            />
          </div>
          <div className="option-group">
            <label>Font Color:</label>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
            />
          </div>
          <div className="option-group">
            <label>Font Family:</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              <option value="Arial">Arial</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Verdana">Verdana</option>
            </select>
          </div>
          <div className="option-group">
            <label>Background Color:</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>
          <div className="option-group">
            <button
              onClick={() => document.execCommand("bold", false, null)}
              style={{ fontWeight: "bold", marginRight: "10px" }}
            >
              B
            </button>
            <button
              onClick={() => document.execCommand("italic", false, null)}
              style={{ fontStyle: "italic",marginRight: "10px"  }}
            >
              I
            </button>
            <button
              onClick={() => document.execCommand("underline", false, null)}
              style={{ textDecoration: "underline" }}
            >
              U
            </button>
          </div>
          <div className="option-group">
            <label>Container Shape:</label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value)}
            >
              <option value="square">Square</option>
              <option value="circle">Circle</option>
              <option value="rounded">Rounded</option>
            </select>
          </div>
          {shape === "circle" && (
            <div className="option-group">
              <label>Border Radius:</label>
              <input
                type="range"
                min="0"
                max="100"
                value={borderRadius}
                onChange={(e) => setBorderRadius(e.target.value)}
              />
              <span>{borderRadius}%</span>
            </div>
          )}
          <div className="option-group">
            <label>Margin (px):</label>
            <input
              type="number"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
              min="0"
            />
          </div>
          <div className="option-group">
            <label>Padding (px):</label>
            <input
              type="number"
              value={padding}
              onChange={(e) => setPadding(e.target.value)}
              min="0"
            />
          </div>
        </div>
      )}
      <div
        className="text-box"
        style={{
          fontSize: `${fontSize}px`,
          color: fontColor,
          fontFamily,
        }}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: text }}
      ></div>
    </div>
  );
};

export default TextBox;
