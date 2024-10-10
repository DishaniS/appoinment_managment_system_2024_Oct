import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Form, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';

export default function DigitalLibraryCreateScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [image, setImage] = useState('');
  const [resourceFile, setResourceFile] = useState('');
  const [datePublished, setDatePublished] = useState('');
  const [loading, setLoading] = useState(false);

  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

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
      setLoading(true);
      await axios.post(
        '/api/digital-library',
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
      setLoading(false);
      toast.success('Resource created successfully');
      navigate('/digital-library');
    } catch (err) {
      setLoading(false);
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <Helmet>
        <title>Add Digital Library Resource</title>
      </Helmet>
      <h1>Add Digital Library Resource</h1>
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
          <Button type="submit" disabled={loading}>
            Add Resource
          </Button>
          {loading && <LoadingBox />}
        </div>
      </Form>
    </div>
  );
}
