import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Form, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';

export default function DigitalLibraryEditScreen() {
  const { id: resourceId } = useParams();
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [image, setImage] = useState('');
  const [resourceFile, setResourceFile] = useState('');
  const [datePublished, setDatePublished] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/digital-library/${resourceId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setTitle(data.title);
        setDescription(data.description);
        setAuthor(data.author);
        setImage(data.image);
        setResourceFile(data.resourceFile);
        setDatePublished(data.datePublished.substring(0, 10)); // Format date for input
        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast.error(getError(err));
      }
    };
    fetchResource();
  }, [resourceId, userInfo]);

  const uploadFileHandler = async (e, setFile) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    try {
      setLoading(true);
      const { data } = await axios.post('/api/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      setFile(data);
      setLoading(false);
      toast.success('File uploaded successfully');
    } catch (err) {
      setLoading(false);
      toast.error(getError(err));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoadingUpdate(true);
      await axios.put(
        `/api/digital-library/${resourceId}`,
        {
          title,
          description,
          author,
          image,
          resourceFile,
          datePublished,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      setLoadingUpdate(false);
      toast.success('Resource updated successfully');
      navigate('/digital-library');
    } catch (err) {
      setLoadingUpdate(false);
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <Helmet>
        <title>Edit Digital Library Resource</title>
      </Helmet>
      <h1>Edit Digital Library Resource</h1>
      {loading ? (
        <LoadingBox />
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="author">
            <Form.Label>Author</Form.Label>
            <Form.Control
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="image">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
            <Form.Control
              type="file"
              onChange={(e) => uploadFileHandler(e, setImage)}
            />
            {loading && <LoadingBox />}
          </Form.Group>
          <Form.Group className="mb-3" controlId="resourceFile">
            <Form.Label>Resource File</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter file URL"
              value={resourceFile}
              onChange={(e) => setResourceFile(e.target.value)}
              required
            />
            <Form.Control
              type="file"
              onChange={(e) => uploadFileHandler(e, setResourceFile)}
            />
            {loading && <LoadingBox />}
          </Form.Group>
          <Form.Group className="mb-3" controlId="datePublished">
            <Form.Label>Date Published</Form.Label>
            <Form.Control
              type="date"
              value={datePublished}
              onChange={(e) => setDatePublished(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button type="submit" disabled={loadingUpdate}>
              Update Resource
            </Button>
            {loadingUpdate && <LoadingBox />}
          </div>
        </Form>
      )}
    </div>
  );
}
