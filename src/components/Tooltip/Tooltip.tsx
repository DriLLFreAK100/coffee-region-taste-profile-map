import React, { FC } from 'react';
import './Tooltip.scss';

interface ITooltip {
  children: any;
}

const Tooltip: FC<ITooltip> = ({ children }) => {
  return (
    <div className="Tooltip">
      <div className="Tooltip--content">
        {children}
      </div>
    </div>
  );
}

export default Tooltip