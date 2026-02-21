import { useState } from 'react';

const SignatureStyleSelector = ({ name, onSelectStyle }) => {
  const [selectedStyle, setSelectedStyle] = useState(null);

  const signatureStyles = [
    { id: 1, name: 'Elegant Script', font: "'Brush Script MT', cursive", style: { fontFamily: "'Brush Script MT', cursive", fontSize: '32px', fontStyle: 'italic' } },
    { id: 2, name: 'Classic Handwriting', font: "'Lucida Handwriting', cursive", style: { fontFamily: "'Lucida Handwriting', cursive", fontSize: '28px' } },
    { id: 3, name: 'Modern Signature', font: "'Segoe Script', cursive", style: { fontFamily: "'Segoe Script', cursive", fontSize: '30px', fontWeight: '500' } },
    { id: 4, name: 'Bold Script', font: "'Comic Sans MS', cursive", style: { fontFamily: "'Comic Sans MS', cursive", fontSize: '32px', fontWeight: 'bold' } },
    { id: 5, name: 'Formal Cursive', font: "'Monotype Corsiva', cursive", style: { fontFamily: "'Monotype Corsiva', cursive", fontSize: '34px' } },
    { id: 6, name: 'Simple Italic', font: "'Georgia', serif", style: { fontFamily: "'Georgia', serif", fontSize: '28px', fontStyle: 'italic', fontWeight: '600' } },
  ];

  const handleSelect = (style) => {
    setSelectedStyle(style.id);
    if (onSelectStyle) {
      onSelectStyle(style);
    }
  };

  return (
    <div className="signature-style-selector">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Choose Your Signature Style:</h3>
      <div className="grid grid-cols-1 gap-3">
        {signatureStyles.map((style) => (
          <div
            key={style.id}
            onClick={() => handleSelect(style)}
            className={`signature-style-option p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedStyle === style.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">{style.name}</span>
              {selectedStyle === style.id && (
                <span className="text-primary-600 text-xs">✓ Selected</span>
              )}
            </div>
            <div
              className="signature-preview text-center py-2"
              style={style.style}
            >
              {name || 'Your Name'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignatureStyleSelector;
