import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Form, Button } from 'react-bootstrap';
import { getError } from '../utils';
import { Store } from '../Store';

export default function PrescriptionEditScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = React.useContext(Store);
  const { userInfo } = state;

  const [patientName, setPatientName] = useState('');
  const [optometrist, setOptometrist] = useState('');
  const [prescriptionDetails, setPrescriptionDetails] = useState('');
  const [dateIssued, setDateIssued] = useState('');
  const [loading, setLoading] = useState(true);
  const [optometrists, setOptometrists] = useState([]);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const { data } = await axios.get(`/api/prescriptions/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setPatientName(data.patientName);
        setOptometrist(data.optometrist?._id || ''); // Handle if optometrist is an object or null
        setPrescriptionDetails(data.prescriptionDetails);
        setDateIssued(data.dateIssued.split('T')[0]); // Format date to 'YYYY-MM-DD'
        setLoading(false);
      } catch (err) {
        toast.error(getError(err));
        setLoading(false);
      }
    };

    const fetchOptometrists = async () => {
      try {
        const { data } = await axios.get('/api/optometrists', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setOptometrists(data);
      } catch (err) {
        toast.error('Failed to load optometrists');
      }
    };

    fetchPrescription();
    fetchOptometrists();
  }, [id, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `/api/prescriptions/${id}`,
        {
          patientName,
          optometrist,
          prescriptionDetails,
          dateIssued,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      toast.success('Prescription updated successfully');
      navigate('/admin/prescriptions');
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <h1>Edit Prescription</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="patientName">
            <Form.Label>Patient Name</Form.Label>
            <Form.Control
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="optometrist">
            <Form.Label>Optometrist</Form.Label>
            <Form.Select
              value={optometrist}
              onChange={(e) => setOptometrist(e.target.value)}
              required
            >
              <option value="">Select Optometrist</option>
              {optometrists.map((opt) => (
                <option key={opt._id} value={opt._id}>
                  {opt.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="prescriptionDetails">
            <Form.Label>Prescription Details</Form.Label>
            <Form.Control
              as="textarea"
              value={prescriptionDetails}
              onChange={(e) => setPrescriptionDetails(e.target.value)}
              rows={3}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="dateIssued">
            <Form.Label>Date Issued</Form.Label>
            <Form.Control
              type="date"
              value={dateIssued}
              onChange={(e) => setDateIssued(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit">Update</Button>
        </Form>
      )}
    </div>
  );
}
