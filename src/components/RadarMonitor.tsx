import React from 'react';

const RadarMonitor: React.FC = () => {
  return (
    <div className="radar-wrap">
      <div className="radar">
        <span className="blip" style={{ left: '58%', top: '30%' }} />
        <span className="blip b2" style={{ left: '33%', top: '60%' }} />
        <span className="blip b3" style={{ left: '70%', top: '66%' }} />
        <div className="sweep" />
      </div>
    </div>
  );
};

export default RadarMonitor;
