import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState, useRef } from 'react';
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
        prescriptions: action.payload,
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

export default function PrescriptionListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, prescriptions, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, { loading: true, error: '', prescriptions: [] });

  const [searchQuery, setSearchQuery] = useState(''); // For search functionality

  const componentRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/prescriptions', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        console.error(err);
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (userInfo && userInfo.isAdmin) {
      fetchData();
    } else {
      toast.error('Access denied. Admins only.');
      navigate('/');
    }
  }, [userInfo, navigate, successDelete]);

  useEffect(() => {
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    }
  }, [successDelete]);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure to delete this prescription?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/prescriptions/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Prescription deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(err));
        dispatch({ type: 'DELETE_FAIL' });
      }
    }
  };

  // Generate summary PDF report for all prescriptions
  const generateSummaryPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Prescription Summary Report', 105, 20, null, null, 'center');

    const tableColumn = ['Prescription ID', 'Patient Name', 'Optometrist', 'Date Issued'];
    const tableRows = [];

    const filteredPrescriptions = prescriptions.filter(
      (prescription) =>
        prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prescription.optometrist?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filteredPrescriptions.forEach((prescription) => {
      const prescriptionData = [
        prescription._id,
        prescription.patientName,
        prescription.optometrist?.name || 'N/A',
        new Date(prescription.dateIssued).toLocaleDateString(),
      ];
      tableRows.push(prescriptionData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
    });

    doc.save('Prescription_Summary_Report.pdf');
  };

  // Generate PDF for an individual prescription
  const generateIndividualPDF = (prescription) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ICare Opticals", 105, 20, null, null, "center");
    doc.setFontSize(12);
    doc.text("Optometrist Prescription", 105, 30, null, null, "center");
    doc.line(20, 35, 190, 35); // Horizontal line for separation

    doc.setFontSize(14);
    doc.text(`Prescription ID: ${prescription._id}`, 20, 50);
    doc.text(`Patient Name: ${prescription.patientName}`, 20, 60);
    doc.text(`Optometrist: ${prescription.optometrist?.name || 'N/A'}`, 20, 70);
    doc.text(`Date Issued: ${new Date(prescription.dateIssued).toLocaleDateString()}`, 20, 80);
    
    doc.setFontSize(14);
    doc.text("Prescription Details:", 20, 100);
    
    doc.setFontSize(12);
    doc.text(`${prescription.prescriptionDetails}`, 20, 110, { maxWidth: 170 }); // Prescription details with max width
    
    doc.line(20, 180, 190, 180); // Horizontal line for doctor's signature
    doc.text("Doctor's Signature", 105, 190, null, null, "center");

    doc.save(`${prescription.patientName}_Prescription.pdf`);
  };

  return (
    <>
      <div className='printalignprescriptions'>
        <ReactToPrint
          //trigger={() => <button className='print' type="button">Print Prescription Summary</button>}
          content={() => componentRef.current}
        />
        <button onClick={generateSummaryPDF} className='download-button'>Download Prescription Report</button>
      </div>
      <div ref={componentRef}>
        <Helmet>
          <title>Prescriptions</title>
        </Helmet>
        <h1>Prescriptions Report</h1>

        {/* Search Bar */}
        <Form.Control
          type="text"
          placeholder="Search by patient or optometrist name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-3"
        />

        {loadingDelete && <LoadingBox />}
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>PATIENT NAME</th>
                <th>OPTOMETRIST</th>
                <th>DATE ISSUED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions
                .filter(
                  (prescription) =>
                    prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    prescription.optometrist?.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((prescription, index) => (
                  <tr key={prescription._id}>
                    <td>{prescription._id}</td>
                    <td>{prescription.patientName}</td>
                    <td>{prescription.optometrist?.name || 'N/A'}</td>
                    <td>{new Date(prescription.dateIssued).toLocaleDateString()}</td>
                    <td>
                      <Button
                        type="button"
                        variant="light"
                        onClick={() => navigate(`/admin/prescription/${prescription._id}`)}
                      >
                        Edit
                      </Button>
                      &nbsp;
                      <Button
                        type="button"
                        variant="light"
                        onClick={() => deleteHandler(prescription._id)}
                      >
                        Delete
                      </Button>
                      &nbsp;
                      <Button
                        type="button"
                        variant="light"
                        onClick={() => generateIndividualPDF(prescription)}
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
