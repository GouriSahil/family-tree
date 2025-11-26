import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import './FamilyNode.css';

const FamilyNode = ({ data }) => {
  return (
    <div className="family-node">
      <Handle type="target" position={Position.Top} className="node-handle" />
      <div className="node-content">
        <div className="node-photo-container">
          <img
            src={data.photo || 'https://via.placeholder.com/80/6B7280/ffffff?text=?'}
            alt={data.name}
            className="node-photo"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/80/6B7280/ffffff?text=?';
            }}
          />
          <div className={`gender-badge ${data.gender}`}>
            {data.gender === 'male' ? '♂' : '♀'}
          </div>
        </div>
        <div className="node-name">{data.name}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="node-handle" />
    </div>
  );
};

export default memo(FamilyNode);


