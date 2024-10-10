import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button, Table, FormControl } from 'react-bootstrap';
import { getError } from '../utils';
import { Store } from '../Store';

export default function OptometristListScreen() {
  const [optometrists, setOptometrists] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

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

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure to delete this optometrist?')) {
      try {
        await axios.delete(`/api/optometrists/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }, // Include token in headers
        });
        toast.success('Optometrist deleted successfully');
        setOptometrists(optometrists.filter((o) => o._id !== id));
      } catch (err) {
        toast.error(getError(err));
      }
    }
  };

  const filteredOptometrists = optometrists.filter((optometrist) =>
    optometrist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    optometrist.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Optometrists</h1>
      <Button onClick={() => navigate('/admin/optometrist/create')} className="mb-3">
        Create Optometrist
      </Button>

      <FormControl
        type="text"
        placeholder="Search by name or specialty"
        className="mb-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>NAME</th>
            <th>SPECIALTY</th>
            <th>CONTACT</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {filteredOptometrists.map((optometrist) => (
            <tr key={optometrist._id}>
              <td>{optometrist._id}</td>
              <td>{optometrist.name}</td>
              <td>{optometrist.specialty}</td>
              <td>{optometrist.contact}</td>
              <td>
                <Button
                  type="button"
                  variant="light"
                  onClick={() => navigate(`/admin/optometrist/${optometrist._id}`)}
                  className="me-2"
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => deleteHandler(optometrist._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
