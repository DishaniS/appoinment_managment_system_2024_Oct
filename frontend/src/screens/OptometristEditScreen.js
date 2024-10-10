import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Form, Button } from 'react-bootstrap';
import { Store } from '../Store';

export default function OptometristEditScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState({});

  // Enum for specialties related to eye care and opticals
  const specialties = [
    'General Optometrist',
    'Pediatric Optometrist',
    'Geriatric Optometrist',
    'Low Vision Specialist',
    'Contact Lens Specialist',
    'Ocular Disease Specialist',
    'Vision Therapy Specialist',
  ];

  useEffect(() => {
    const fetchOptometrist = async () => {
      try {
        const { data } = await axios.get(`/api/optometrists/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }, // Include authorization header
        });
        setName(data.name);
        setSpecialty(data.specialty);
        setContact(data.contact);
      } catch (err) {
        toast.error(
          err.response && err.response.data.message
            ? err.response.data.message
            : 'Failed to load optometrist data'
        );
      }
    };
    fetchOptometrist();
  }, [id, userInfo]);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!specialty) newErrors.specialty = 'Specialty is required';
    if (!contact || contact.length !== 10 || !/^\d+$/.test(contact)) {
      newErrors.contact = 'Contact number must be 10 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.put(
        `/api/optometrists/${id}`,
        { name, specialty, contact }, // Include contact in the update request
        {
          headers: { Authorization: `Bearer ${userInfo.token}` }, // Include authorization header
        }
      );
      toast.success('Optometrist updated successfully');
      navigate('/admin/optometrists');
    } catch (err) {
      toast.error(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Failed to update optometrist'
      );
    }
  };

  return (
    <div>
      <h1>Edit Optometrist</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            isInvalid={!!errors.name}
            required
          />
          <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Specialty</Form.Label>
          <Form.Control
            as="select"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            isInvalid={!!errors.specialty}
            required
          >
            <option value="">Select Specialty</option>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </Form.Control>
          <Form.Control.Feedback type="invalid">{errors.specialty}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Contact</Form.Label> {/* Add contact field */}
          <Form.Control
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            isInvalid={!!errors.contact}
            required
          />
          <Form.Control.Feedback type="invalid">{errors.contact}</Form.Control.Feedback>
        </Form.Group>

        <Button type="submit">Update</Button>
      </Form>
    </div>
  );
}
