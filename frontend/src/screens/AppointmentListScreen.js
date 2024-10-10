import React, { useContext, useEffect, useReducer, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import ReactToPrint from 'react-to-print';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        appointments: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};

export default function AppointmentListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, appointments, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, { loading: true, error: '', appointments: [] });

  const [searchQuery, setSearchQuery] = useState(''); // For search functionality
  const componentRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/appointments', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (userInfo && userInfo.isAdmin) {
      fetchData();
    } else {
      toast.error('Access denied. Admins only.');
      navigate('/'); // Redirect to home if not admin
    }
  }, [userInfo, navigate, successDelete]);

  useEffect(() => {
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    }
  }, [successDelete]);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/appointments/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Appointment deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(err));
        dispatch({ type: 'DELETE_FAIL' });
      }
    }
  };

  // Generate PDF for the entire appointment summary
  const generateSummaryPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Appointment Summary Report', 105, 20, null, null, 'center');

    const tableColumn = ['ID', 'Patient', 'Optometrist', 'Date', 'Time Slot', 'Subject', 'Status'];
    const tableRows = [];

    const filteredAppointments = appointments.filter(
      (appointment) =>
        appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (appointment.optometrist && appointment.optometrist.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        appointment.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filteredAppointments.forEach((appointment) => {
      const appointmentData = [
        appointment._id,
        appointment.patientName,
        appointment.optometrist?.name || 'N/A',
        new Date(appointment.date).toLocaleDateString(),
        appointment.timeSlot,
        appointment.subject,
        appointment.status,
      ];
      tableRows.push(appointmentData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
    });

    doc.save('Appointment_Summary_Report.pdf');
  };

  // Generate PDF for an individual appointment
  const generateIndividualPDF = (appointment) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ICare Opticals", 105, 20, null, null, "center");
    doc.setFontSize(12);
    doc.text("Appointment Details", 105, 30, null, null, "center");
    doc.line(20, 35, 190, 35); // Horizontal line for separation

    doc.setFontSize(14);
    doc.text(`Appointment ID: ${appointment._id}`, 20, 50);
    doc.text(`Patient: ${appointment.patientName}`, 20, 60);
    doc.text(`Optometrist: ${appointment.optometrist?.name || 'N/A'}`, 20, 70);
    doc.text(`Date: ${new Date(appointment.date).toLocaleDateString()}`, 20, 80);
    doc.text(`Time Slot: ${appointment.timeSlot}`, 20, 90);
    doc.text(`Subject: ${appointment.subject}`, 20, 100);
    doc.text(`Status: ${appointment.status}`, 20, 110);

    doc.save(`${appointment.patientName}_Appointment.pdf`);
  };

  return (
    <>
      <div className='printalignappointments'>
        {/* <ReactToPrint
          trigger={() => (
            <button className='print' type='button'>
              Download Appointment Summary
            </button>
          )}
          content={() => componentRef.current}
        /> */}
        <button onClick={generateSummaryPDF} className='download-button'>
          Download Appointment Report
        </button>
      </div>
      <div ref={componentRef}>
        <Helmet>
          <title>Appointments</title>
        </Helmet>
        <h1>Appointment List</h1>

        {/* Search Bar */}
        <Form.Control
          type="text"
          placeholder="Search by patient, optometrist, or subject"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-3"
        />

        {loadingDelete && <LoadingBox />}
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant='danger'>{error}</MessageBox>
        ) : (
          <table className='table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>PATIENT</th>
                <th>OPTOMETRIST</th>
                <th>DATE</th>
                <th>TIME SLOT</th>
                <th>SUBJECT</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {appointments
                .filter(
                  (appointment) =>
                    appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (appointment.optometrist &&
                      appointment.optometrist.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    appointment.subject.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{appointment._id}</td>
                    <td>{appointment.patientName}</td>
                    <td>{appointment.optometrist ? appointment.optometrist.name : 'N/A'}</td>
                    <td>{new Date(appointment.date).toLocaleDateString()}</td>
                    <td>{appointment.timeSlot}</td>
                    <td>{appointment.subject}</td>
                    <td>{appointment.status}</td>
                    <td>
                      <Button
                        type='button'
                        variant='light'
                        onClick={() => navigate(`/admin/appointment/${appointment._id}`)}
                      >
                        Edit
                      </Button>
                      &nbsp;
                      <Button
                        type='button'
                        variant='light'
                        onClick={() => deleteHandler(appointment._id)}
                      >
                        Delete
                      </Button>
                      &nbsp;
                      <Button
                        type='button'
                        variant='light'
                        onClick={() => generateIndividualPDF(appointment)}
                      >
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
