import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button, Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, appointments: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function MyAppointmentsScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, appointments }, dispatch] = useReducer(reducer, {
    loading: true,
    appointments: [],
    error: '',
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/appointments/mine', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
        toast.error(getError(err));
      }
    };
    fetchAppointments();
  }, [userInfo]);

  return (
    <div>
      <Helmet>
        <title>My Appointments</title>
      </Helmet>
      <h1>My Appointments</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Optometrist</th>
              <th>Date</th>
              <th>Time Slot</th>
              <th>Subject</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment._id}>
                <td>{appointment._id}</td>
                <td>{appointment.optometrist.name}</td>
                <td>{new Date(appointment.date).toLocaleDateString()}</td>
                <td>{appointment.timeSlot}</td>
                <td>{appointment.subject}</td>
                <td>{appointment.status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
