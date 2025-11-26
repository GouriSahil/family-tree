import { useState, useEffect } from 'react';
import './Modal.css';

const AddMemberModal = ({ isOpen, onClose, onAdd, existingMembers, selectedParent }) => {
  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    gender: 'male',
    fatherId: '',
    motherId: '',
  });

  useEffect(() => {
    if (selectedParent) {
      if (selectedParent.data.gender === 'male') {
        setFormData((prev) => ({ ...prev, fatherId: selectedParent.id }));
      } else {
        setFormData((prev) => ({ ...prev, motherId: selectedParent.id }));
      }
    } else {
      setFormData({
        name: '',
        photo: '',
        gender: 'male',
        fatherId: '',
        motherId: '',
      });
    }
  }, [selectedParent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a name');
      return;
    }
    onAdd(formData);
    setFormData({
      name: '',
      photo: '',
      gender: 'male',
      fatherId: '',
      motherId: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const maleMembers = existingMembers.filter((m) => m.data.gender === 'male');
  const femaleMembers = existingMembers.filter((m) => m.data.gender === 'female');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{selectedParent ? `Add Child to ${selectedParent.data.name}` : 'Add Family Member'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="member-form">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter name"
            />
          </div>

          <div className="form-group">
            <label>Photo URL</label>
            <input
              type="url"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
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

          <div className="form-group">
            <label>Father (Optional)</label>
            <select
              name="fatherId"
              value={formData.fatherId}
              onChange={handleChange}
            >
              <option value="">None</option>
              {maleMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.data.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Mother (Optional)</label>
            <select
              name="motherId"
              value={formData.motherId}
              onChange={handleChange}
            >
              <option value="">None</option>
              {femaleMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.data.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn btn-submit">
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;


