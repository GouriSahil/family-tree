import { useState } from 'react';
import './Modal.css';

const MemberDetailsModal = ({ isOpen, onClose, member, onUpdate, onDelete, onAddChild }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: member.name,
    photo: member.photo || '',
    gender: member.gender || 'male',
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    onUpdate({ ...member, ...formData });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${member.name}?`)) {
      onDelete(member.id);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Member Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {!isEditing ? (
          <div className="member-details">
            <div className="detail-photo-container">
              <img
                src={member.photo || 'https://via.placeholder.com/150/6B7280/ffffff?text=?'}
                alt={member.name}
                className="detail-photo"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150/6B7280/ffffff?text=?';
                }}
              />
              <div className={`detail-gender-badge ${member.gender}`}>
                {member.gender === 'male' ? '♂' : '♀'}
              </div>
            </div>
            <div className="detail-info">
              <h3>{member.name}</h3>
              <p className="detail-gender">Gender: {member.gender === 'male' ? 'Male' : 'Female'}</p>
            </div>
            <div className="detail-actions">
              <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                ✏️ Edit
              </button>
              <button onClick={() => onAddChild(member)} className="btn btn-success">
                👶 Add Child
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                🗑️ Delete
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="member-form">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Photo URL</label>
              <input
                type="url"
                name="photo"
                value={formData.photo}
                onChange={handleChange}
              />
              {formData.photo && (
                <img src={formData.photo} alt="Preview" className="photo-preview" onError={(e) => e.target.style.display = 'none'} />
              )}
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: member.name,
                    photo: member.photo || '',
                    gender: member.gender || 'male',
                  });
                }}
                className="btn btn-cancel"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-submit">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MemberDetailsModal;


