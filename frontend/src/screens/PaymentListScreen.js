import React, { useContext, useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Form } from 'react-bootstrap';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // For table generation in PDF

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, successDelete: false };
    default:
      return state;
  }
};

export default function PaymentListScreen() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, orders = [], loadingDelete, successDelete }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    orders: [], // Initialize as empty array
  });

  const [searchQuery, setSearchQuery] = useState(''); // For search functionality

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const deleteHandler = async (orderId) => {
    if (window.confirm('Are you sure to delete this payment?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Payment Record deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(err));
        dispatch({ type: 'DELETE_FAIL' });
      }
    }
  };

  const togglePaidStatusHandler = async (order) => {
    try {
      await axios.put(
        `/api/orders/${order._id}/pay`,
        { isPaid: !order.isPaid },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      toast.success('Order payment status updated');
      dispatch({ type: 'FETCH_SUCCESS', payload: orders.map((o) => (o._id === order._id ? { ...o, isPaid: !o.isPaid } : o)) });
    } catch (err) {
      toast.error(getError(err));
    }
  };

  // Filter orders based on search query
  const filteredOrders = orders?.filter(
    (order) =>
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.isPaid ? 'paid' : 'not paid').includes(searchQuery.toLowerCase())
  );

  // Generate PDF report for all payments
  const generatePaymentReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Payment Report - ICare Opticals', 105, 20, null, null, 'center');
    doc.setFontSize(12);
    doc.text('Address: Colombo 07, Sri Lanka | Contact: (076) 292-9623', 105, 30, null, null, 'center');

    const tableColumn = ['Order ID', 'Total Price', 'Payment Method', 'Paid'];
    const tableRows = [];

    filteredOrders.forEach((order) => {
      const orderData = [
        order._id,
        `Rs. ${order.totalPrice.toFixed(2)}`,
        order.paymentMethod,
        order.isPaid ? 'Yes' : 'No',
      ];
      tableRows.push(orderData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
    });

    doc.save('Payment_Report.pdf');
  };

  // Generate PDF receipt for individual payment
  const generatePaymentReceipt = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('ICare Opticals', 105, 20, null, null, 'center');
    doc.setFontSize(12);
    doc.text('Address: Colombo 07, Sri Lanka | Contact: (076) 292-9623', 105, 30, null, null, 'center');
    doc.line(20, 35, 190, 35);

    doc.setFontSize(14);
    doc.text(`Order ID: ${order._id}`, 20, 50);
    doc.text(`Total Price: Rs. ${order.totalPrice.toFixed(2)}`, 20, 60);
    doc.text(`Payment Method: ${order.paymentMethod}`, 20, 70);
    doc.text(`Paid: ${order.isPaid ? 'Yes' : 'No'}`, 20, 80);
    doc.text(`Date: ${new Date(order.paidAt || Date.now()).toLocaleDateString()}`, 20, 90);

    doc.setFontSize(12);
    doc.text('Thank you for your payment!', 105, 110, null, null, 'center');

    doc.save(`Receipt_${order._id}.pdf`);
  };

  return (
    <div>
      <h1>Payments</h1>

      {/* Search Bar */}
      <Form.Control
        type="text"
        placeholder="Search by order ID, payment method, or status"
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
        <>
          <Button onClick={generatePaymentReport} className="mb-3">
            Generate Payment Report
          </Button>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>TOTAL PRICE (Rs)</th>
                <th>PAYMENT METHOD</th>
                <th>PAID</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>Rs. {order.totalPrice.toFixed(2)}</td>
                  <td>{order.paymentMethod}</td>
                  <td>
                    {userInfo.isAdmin && (
                      <Button
                        variant={order.isPaid ? 'success' : 'danger'}
                        onClick={() => togglePaidStatusHandler(order)}
                      >
                        {order.isPaid ? 'Paid' : 'Not Paid'}
                      </Button>
                    )}
                  </td>
                  <td>
                    <Button variant="light" onClick={() => generatePaymentReceipt(order)}>
                      Download Receipt
                    </Button>
                    &nbsp;
                    <Button variant="danger" onClick={() => deleteHandler(order._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
}
