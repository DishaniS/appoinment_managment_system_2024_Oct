import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Form, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';

export default function AppointmentEditScreen() {
  const { id: appointmentId } = useParams();
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [patientName, setPatientName] = useState('');
  const [optometrist, setOptometrist] = useState('');
  const [optometrists, setOptometrists] = useState([]);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/appointments/${appointmentId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setPatientName(data.patientName);
        setOptometrist(data.optometrist?._id || '');
        setDate(data.date ? data.date.substring(0, 10) : '');
        setTimeSlot(data.timeSlot || '');
        setSubject(data.subject || '');
        setStatus(data.status || 'Pending');
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast.error(getError(err));
      }
    };

    const fetchOptometrists = async () => {
      try {
        const { data } = await axios.get('/api/optometrists', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setOptometrists(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };

    fetchAppointment();
    fetchOptometrists();
  }, [appointmentId, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(
        `/api/appointments/${appointmentId}`,
        {
          patientName,
          optometrist,
          date,
          timeSlot,
          subject,
          status,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      setLoading(false);
      toast.success('Appointment updated successfully');
      navigate('/admin/appointments');
    } catch (err) {
      setLoading(false);
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <Helmet>
        <title>Edit Appointment</title>
      </Helmet>
      <h1>Edit Appointment</h1>
      {loading ? (
        <LoadingBox />
      ) : (
        <Form onSubmit={submitHandler}>
          {/* Editable Patient Name Field */}
          <Form.Group className="mb-3" controlId="patientName">
            <Form.Label>Patient Name</Form.Label>
            <Form.Control
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
            />
          </Form.Group>

          {/* Editable Optometrist Field */}
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

          {/* Editable Date Field */}
          <Form.Group className="mb-3" controlId="date">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </Form.Group>

          {/* Editable Time Slot Field */}
          <Form.Group className="mb-3" controlId="timeSlot">
            <Form.Label>Time Slot</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., 10:00 AM - 11:00 AM"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              required
            />
          </Form.Group>

          {/* Editable Subject Field */}
          <Form.Group className="mb-3" controlId="subject">
            <Form.Label>Subject</Form.Label>
            <Form.Control
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </Form.Group>

          {/* Editable Status Field */}
          <Form.Group className="mb-3" controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </Form.Group>

          <div className="mb-3">
            <Button type="submit" disabled={loading}>
              Update Appointment
            </Button>
            {loading && <LoadingBox />}
          </div>
        </Form>
      )}
    </div>
  );
}
