import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Form, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';

export default function AppointmentCreateScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [patientName] = useState(userInfo.name);
  const [optometrist, setOptometrist] = useState('');
  const [optometrists, setOptometrists] = useState([]);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '01:00 PM - 02:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
  ];

  useEffect(() => {
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

    fetchOptometrists();
  }, [userInfo]);

  const validateForm = () => {
    const errors = {};
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    if (!optometrist) {
      errors.optometrist = 'Please select an optometrist';
    }
    if (!date) {
      errors.date = 'Please select a date';
    } else if (date < today) {
      errors.date = 'Date must be today or in the future';
    }
    if (!timeSlot) {
      errors.timeSlot = 'Please select a time slot';
    }
    if (!subject) {
      errors.subject = 'Subject is required';
    }

    return errors;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        '/api/appointments',
        {
          patientName,
          optometrist,
          date,
          timeSlot,
          subject,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      setLoading(false);
      toast.success('Appointment created successfully');
      navigate('/');
    } catch (err) {
      setLoading(false);
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <Helmet>
        <title>Create Appointment</title>
      </Helmet>
      <h1>Create Appointment</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="patientName">
          <Form.Label>Patient Name</Form.Label>
          <Form.Control type="text" value={patientName} readOnly />
        </Form.Group>

        <Form.Group className="mb-3" controlId="optometrist">
          <Form.Label>Optometrist</Form.Label>
          <Form.Select
            value={optometrist}
            onChange={(e) => setOptometrist(e.target.value)}
            isInvalid={!!errors.optometrist}
          >
            <option value="">Select Optometrist</option>
            {optometrists.map((opt) => (
              <option key={opt._id} value={opt._id}>
                {opt.name}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.optometrist}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="date">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            isInvalid={!!errors.date}
          />
          <Form.Control.Feedback type="invalid">{errors.date}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="timeSlot">
          <Form.Label>Time Slot</Form.Label>
          <Form.Select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            isInvalid={!!errors.timeSlot}
          >
            <option value="">Select Time Slot</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.timeSlot}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="subject">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            isInvalid={!!errors.subject}
          />
          <Form.Control.Feedback type="invalid">{errors.subject}</Form.Control.Feedback>
        </Form.Group>

        <div className="mb-3">
          <Button type="submit" disabled={loading}>
            Create Appointment
          </Button>
          {loading && <LoadingBox />}
        </div>
      </Form>
    </div>
  );
}
