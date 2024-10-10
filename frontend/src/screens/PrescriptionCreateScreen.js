import axios from 'axios';
import React, { useContext, useReducer, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false, errorCreate: action.payload };
    case 'FETCH_REQUEST':
      return { ...state, loadingOptometrists: true };
    case 'FETCH_SUCCESS':
      return { ...state, loadingOptometrists: false, optometrists: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loadingOptometrists: false, errorFetch: action.payload };
    default:
      return state;
  }
};

export default function PrescriptionCreateScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate(); // Initialize navigate

  const [{ loadingCreate, loadingOptometrists, optometrists }, dispatch] = useReducer(reducer, {
    loadingCreate: false,
    loadingOptometrists: true,
    optometrists: [],
  });

  const [patientName, setPatientName] = useState('');
  const [optometrist, setOptometrist] = useState('');
  const [prescriptionDetails, setPrescriptionDetails] = useState('');
  const [dateIssued, setDateIssued] = useState('');

  useEffect(() => {
    const fetchOptometrists = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/optometrists', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
        toast.error(getError(err));
      }
    };
    fetchOptometrists();
  }, [userInfo.token]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      await axios.post(
        '/api/prescriptions',
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
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Prescription created successfully');
      navigate('/admin/prescriptions'); // Redirect to the prescription list page
    } catch (err) {
      dispatch({
        type: 'CREATE_FAIL',
        payload: getError(err),
      });
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <Helmet>
        <title>Create Prescription</title>
      </Helmet>
      <h1>Create Prescription</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="patientName">
          <Form.Label>Patient Name</Form.Label>
          <Form.Control
            type="text"
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
            {loadingOptometrists ? (
              <option disabled>Loading...</option>
            ) : (
              optometrists.map((opt) => (
                <option key={opt._id} value={opt._id}>
                  {opt.name}
                </option>
              ))
            )}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="prescriptionDetails">
          <Form.Label>Prescription Details</Form.Label>
          <Form.Control
            as="textarea"
            value={prescriptionDetails}
            onChange={(e) => setPrescriptionDetails(e.target.value)}
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

        <div className="mb-3">
          <Button type="submit" disabled={loadingCreate}>
            Create Prescription
          </Button>
          {loadingCreate && <LoadingBox />}
        </div>
      </Form>
    </div>
  );
}
