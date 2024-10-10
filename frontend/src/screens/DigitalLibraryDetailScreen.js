import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { jsPDF } from 'jspdf';

export default function DigitalLibraryDetailScreen() {
  const { id: resourceId } = useParams();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [resource, setResource] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/digital-library/${resourceId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setResource(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(getError(err));
      }
    };

    fetchResource();
  }, [resourceId, userInfo]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const imageHeight = 60; // Adjust as needed
    const imageWidth = 180; // Adjust as needed
    const margin = 10;

    // Add Image
    if (resource.image) {
      const img = new Image();
      img.src = resource.image;
      doc.addImage(img, 'JPEG', margin, margin, imageWidth, imageHeight);
    }

    // Add Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(resource.title, margin, imageHeight + margin + 20);

    // Add Description
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Description:', margin, imageHeight + margin + 35);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(resource.description, 180), margin, imageHeight + margin + 45);

    // Add Author
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Author:', margin, imageHeight + margin + 65);
    doc.setFont('helvetica', 'normal');
    doc.text(resource.author, margin + 30, imageHeight + margin + 65);

    // Add Date Published
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Date Published:', margin, imageHeight + margin + 75);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(resource.datePublished).toLocaleDateString(), margin + 40, imageHeight + margin + 75);

    // Save the PDF
    doc.save(`${resource.title}_Details.pdf`);
  };

  return (
    <Container className="my-4">
      <Helmet>
        <title>{resource.title || 'Digital Library Resource'}</title>
      </Helmet>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Card className="shadow-sm">
          <Row className="g-0">
            <Col md={4}>
              <Card.Img
                variant="top"
                src={resource.image}
                alt={resource.title}
                className="img-fluid rounded-start"
              />
            </Col>
            <Col md={8}>
              <Card.Body>
                <Card.Title className="mb-3">{resource.title}</Card.Title>
                <Card.Text className="mb-2">
                  <strong>Description:</strong> {resource.description}
                </Card.Text>
                <Card.Text className="mb-2">
                  <strong>Author:</strong> {resource.author}
                </Card.Text>
                <Card.Text className="mb-3">
                  <strong>Date Published:</strong>{' '}
                  {new Date(resource.datePublished).toLocaleDateString()}
                </Card.Text>
                <div className="d-grid">
                  <Button
                    variant="primary"
                    onClick={generatePDF}
                  >
                    Download PDF
                  </Button>
                </div>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      )}
    </Container>
  );
}
