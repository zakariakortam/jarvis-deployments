import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';

export default function TimeRangeSlider() {
  const { data, selectedTimeRange, setSelectedTimeRange } = useStore();
  const [localRange, setLocalRange] = useState(selectedTimeRange);

  useEffect(() => {
    setLocalRange(selectedTimeRange);
  }, [selectedTimeRange]);

  const handleChange = (e) => {
    const value = parseInt(e.target.value);
    const newRange = {
      start: Math.max(0, value - 500),
      end: Math.min(data.length, value + 500),
    };
    setLocalRange(newRange);
  };

  const handleMouseUp = () => {
    setSelectedTimeRange(localRange);
  };

  const startTime = data[localRange.start]?.timestamp;
  const endTime = data[localRange.end - 1]?.timestamp;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
        <span>{startTime?.toLocaleTimeString() || '--:--:--'}</span>
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {localRange.end - localRange.start} samples
        </span>
        <span>{endTime?.toLocaleTimeString() || '--:--:--'}</span>
      </div>
      <input
        type="range"
        min={0}
        max={data.length - 1}
        value={Math.floor((localRange.start + localRange.end) / 2)}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
      />
    </div>
  );
}
