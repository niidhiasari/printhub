import React from 'react';
import { PrinterStatus } from '../types/websocket';

interface PrinterControlsProps {
  printerId: string;
  status: PrinterStatus;
  onCommand: (command: string, params?: any) => void;
}

const PrinterControls: React.FC<PrinterControlsProps> = ({
  printerId,
  status,
  onCommand
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium mb-4">Printer Controls</h3>
      
      {/* Temperature Controls */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Temperature Control</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Nozzle</span>
              <span className="font-medium">{status.temperature.nozzle}°C</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onCommand('setNozzleTemp', { temp: 200 })}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                200°C
              </button>
              <button
                onClick={() => onCommand('setNozzleTemp', { temp: 0 })}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Off
              </button>
            </div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Bed</span>
              <span className="font-medium">{status.temperature.bed}°C</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onCommand('setBedTemp', { temp: 60 })}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                60°C
              </button>
              <button
                onClick={() => onCommand('setBedTemp', { temp: 0 })}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Off
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Controls */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Print Controls</h4>
        <div className="flex space-x-4">
          {status.status === 'printing' ? (
            <>
              <button
                onClick={() => onCommand('pause')}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Pause
              </button>
              <button
                onClick={() => onCommand('cancel')}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </>
          ) : status.status === 'paused' ? (
            <button
              onClick={() => onCommand('resume')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={() => onCommand('home')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Home
            </button>
          )}
        </div>
      </div>

      {/* Fan Control */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Fan Control</h4>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value={status.fanSpeed}
              onChange={(e) => onCommand('setFanSpeed', { speed: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <span className="text-sm font-medium">{status.fanSpeed}%</span>
        </div>
      </div>

      {/* Print Speed */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Print Speed</h4>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="200"
              value={status.printSpeed}
              onChange={(e) => onCommand('setPrintSpeed', { speed: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <span className="text-sm font-medium">{status.printSpeed}%</span>
        </div>
      </div>
    </div>
  );
};

export default PrinterControls; 