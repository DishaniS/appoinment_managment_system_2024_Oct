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
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // For creating tables in the PDF

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};

export default function OrderListScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  // Filter orders based on search query
  const filteredOrders = orders?.filter((order) =>
    order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order._id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteHandler = async (order) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/orders/${order._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Order deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(err));
        dispatch({ type: 'DELETE_FAIL' });
      }
    }
  };

  const markAsDeliveredHandler = async (order) => {
    if (window.confirm('Mark this order as delivered?')) {
      try {
        await axios.put(
          `/api/orders/${order._id}/deliver`,
          {},
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        toast.success('Order marked as delivered');
        dispatch({ type: 'DELETE_RESET' });
      } catch (err) {
        toast.error(getError(err));
      }
    }
  };

  // Generate PDF report
  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Orders Report', 105, 20, null, null, 'center');
    doc.setFontSize(12);

    const tableColumn = ['Order ID', 'User', 'Date', 'Total', 'Paid', 'Delivered'];
    const tableRows = [];

    filteredOrders.forEach((order, index) => {
      const orderData = [
        index + 1,
        order.user?.name || 'DELETED USER',
        order.createdAt.substring(0, 10),
        order.totalPrice.toFixed(2),
        order.isPaid ? order.paidAt.substring(0, 10) : 'No',
        order.isDelivered ? order.deliveredAt.substring(0, 10) : 'No',
      ];
      tableRows.push(orderData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save('Orders_Report.pdf');
  };

  const componentRef = useRef();

  return (
    <><div className='printalignorders'>
      <ReactToPrint
        //trigger={() => <button className='print' type="button" variant="light">Download Order Summary</button>}
        content={() => componentRef.current} />
      <button onClick={downloadPdf} className="download-button">Download Order Summary</button>
      </div><div ref={componentRef}>

        <h1><center><b>ICare</b></center></h1>
        <Helmet>
          <title>Orders</title>
        </Helmet>
        <h1>Orders Report</h1>

        {/* Search Bar */}
        <div className="mb-3">
          <Form.Control
            type="text"
            placeholder="Search by order ID or user name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loadingDelete && <LoadingBox></LoadingBox>}
        {loading ? (
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>USER</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={order._id}>
                  <td>{index + 1}</td>
                  <td>{order.user ? order.user.name : 'DELETED USER'}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>{order.totalPrice.toFixed(2)}</td>
                  <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
                  <td>{order.isDelivered ? order.deliveredAt.substring(0, 10) : 'No'}</td>
                  <td>
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => navigate(`/order/${order._id}`)}
                    >
                      Details
                    </Button>
                    &nbsp;
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => deleteHandler(order)}
                    >
                      Delete
                    </Button>
                    &nbsp;
                    <Button
                      type="button"
                      variant="success"
                      onClick={() => markAsDeliveredHandler(order)}
                    >
                      Mark Delivered
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div></>
  );
}
