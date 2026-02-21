import { useState, useRef, useEffect } from 'react';

const DraggableSignature = ({ signatureText, signatureStyle, signatureImage, onPositionChange }) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const signatureRef = useRef(null);
  const innerRef = useRef(null); // ref to the actual signature content (img or text)

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = signatureRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const container = signatureRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();

    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;

    // Keep signature within bounds
    const maxX = containerRect.width - signatureRef.current.offsetWidth;
    const maxY = containerRect.height - signatureRef.current.offsetHeight;

    const boundedX = Math.max(0, Math.min(newX, maxX));
    const boundedY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: boundedX, y: boundedY });

    if (onPositionChange) {
      // Send the CENTER of the signature content element.
      // The backend maps x,y as the visual center point directly.
      // Using innerRef gives us center of the actual image/text content,
      // accounting for the box padding.
      if (innerRef.current) {
        const innerRect = innerRef.current.getBoundingClientRect();
        const contentCenterX = innerRect.left + innerRect.width / 2 - containerRect.left;
        const contentCenterY = innerRect.top + innerRect.height / 2 - containerRect.top;
        onPositionChange({ x: Math.round(contentCenterX), y: Math.round(contentCenterY) });
      } else {
        // Fallback: use center of outer wrapper
        const wrapperW = signatureRef.current ? signatureRef.current.offsetWidth : 0;
        const wrapperH = signatureRef.current ? signatureRef.current.offsetHeight : 0;
        onPositionChange({
          x: Math.round(boundedX + wrapperW / 2),
          y: Math.round(boundedY + wrapperH / 2),
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Use useEffect to properly manage event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    // Cleanup on unmount
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={signatureRef}
      className={`absolute bg-white border-2 border-blue-500 rounded px-4 py-2 cursor-move select-none ${
        isDragging ? 'shadow-xl opacity-95' : 'shadow-lg'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        maxWidth: '250px',
        width: 'auto',
        minWidth: '150px',
        pointerEvents: 'auto',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-center space-x-1 mb-1">
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
      </div>
      {signatureImage ? (
        <img
          ref={innerRef}
          src={signatureImage}
          alt="Signature"
          className="max-h-16 w-auto pointer-events-none"
          draggable="false"
        />
      ) : (
        <div
          ref={innerRef}
          className="signature-text text-center"
          style={signatureStyle?.style || { fontFamily: 'cursive', fontSize: '24px' }}
        >
          {signatureText}
        </div>
      )}
      <div className="text-xs text-blue-600 mt-1 text-center font-medium">
        {isDragging ? '🖐️ Dragging...' : '✋ Drag to position'}
      </div>
    </div>
  );
};

export default DraggableSignature;
