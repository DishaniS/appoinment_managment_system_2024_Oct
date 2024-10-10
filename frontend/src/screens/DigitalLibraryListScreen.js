import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button, Card, Col, Row, Form } from 'react-bootstrap';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

export default function DigitalLibraryListScreen() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/digital-library', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setResources(data);
        setLoading(false);
      } catch (err) {
        setError(getError(err));
        setLoading(false);
      }
    };
    fetchData();
  }, [userInfo]);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure to delete this resource?')) {
      try {
        await axios.delete(`/api/digital-library/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Resource deleted successfully');
        setResources(resources.filter((resource) => resource._id !== id));
      } catch (err) {
        toast.error(getError(err));
      }
    }
  };

  // Filtering resources based on search query
  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1>Digital Library</h1>
      {userInfo && userInfo.isAdmin && (
        <Button
          type="button"
          className="mb-3"
          onClick={() => navigate('/admin/digital-library/create')}
        >
          Add Resource
        </Button>
      )}

      {/* Search Box */}
      <Form.Control
        type="text"
        placeholder="Search resources..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-3"
      />

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Row>
          {filteredResources.map((resource) => (
            <Col key={resource._id} sm={12} md={6} lg={4} className="mb-3">
              <Card className="h-100">
                <Card.Img
                  variant="top"
                  src={resource.image}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>
                    <Link to={`/digital-library/${resource._id}`}>
                      {resource.title}
                    </Link>
                  </Card.Title>
                  <Card.Text className="text-truncate" style={{ maxHeight: '40px' }}>
                    {resource.description.length > 100
                      ? `${resource.description.substring(0, 100)}...`
                      : resource.description}
                  </Card.Text>
                  <Card.Text>
                    <strong>Author:</strong> {resource.author}
                  </Card.Text>
                  <Card.Text>
                    <strong>Date Published:</strong>{' '}
                    {new Date(resource.datePublished).toLocaleDateString()}
                  </Card.Text>
                  <div className="mt-auto">
                    {userInfo && userInfo.isAdmin && (
                      <>
                        <Button
                          type="button"
                          variant="light"
                          onClick={() =>
                            navigate(`/admin/digital-library/${resource._id}/edit`)
                          }
                          className="mb-2 w-100"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => deleteHandler(resource._id)}
                          className="w-100"
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
