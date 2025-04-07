import React, { useState } from 'react';
import WiFiConfigWizard from './WiFiConfigWizard';

interface WiFiConfigButtonProps {
  printerId: string;
  className?: string;
}

const WiFiConfigButton: React.FC<WiFiConfigButtonProps> = ({
  printerId,
  className = ''
}) => {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowWizard(true)}
        className={`inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
          />
        </svg>
        Configure WiFi
      </button>

      {showWizard && (
        <WiFiConfigWizard
          printerId={printerId}
          onClose={() => setShowWizard(false)}
          onSuccess={() => {
            setShowWizard(false);
            // You can add a success notification here
          }}
          onError={(error) => {
            // You can add an error notification here
            console.error('WiFi configuration error:', error);
          }}
        />
      )}
    </>
  );
};

export default WiFiConfigButton; 