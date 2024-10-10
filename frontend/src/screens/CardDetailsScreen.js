import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { Store } from '../Store';

export default function CardDetailsScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart } = state;

  const [cardNumber, setCardNumber] = useState(cart.cardDetails?.cardNumber || '');
  const [expirationDate, setExpirationDate] = useState(cart.cardDetails?.expirationDate || '');
  const [cvv, setCvv] = useState(cart.cardDetails?.cvv || '');
  const [cardHolderName, setCardHolderName] = useState(cart.cardDetails?.cardHolderName || '');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!cart.paymentMethod || cart.paymentMethod !== 'Card') {
      navigate('/payment'); 
    }
  }, [cart, navigate]);

  const validateCardDetails = () => {
    const errors = {};
    const cardNumberRegex = /^\d{16}$/;
    const expirationDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3,4}$/;

    if (!cardNumberRegex.test(cardNumber)) {
      errors.cardNumber = 'Card number must be 16 digits';
    }
    if (!expirationDateRegex.test(expirationDate)) {
      errors.expirationDate = 'Expiration date must be in MM/YY format';
    }
    if (!cvvRegex.test(cvv)) {
      errors.cvv = 'CVV must be 3 or 4 digits';
    }
    if (!cardHolderName) {
      errors.cardHolderName = 'Cardholder name is required';
    }

    return errors;
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const validationErrors = validateCardDetails();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    ctxDispatch({
      type: 'SAVE_CARD_DETAILS',
      payload: { cardNumber, expirationDate, cvv, cardHolderName },
    });

    localStorage.setItem(
      'cardDetails',
      JSON.stringify({ cardNumber, expirationDate, cvv, cardHolderName })
    );

    navigate('/placeorder');
  };

  return (
    <div className="container small-container">
      <h1 className="my-3">Enter Card Details</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="cardHolderName">
          <Form.Label>Cardholder Name</Form.Label>
          <Form.Control
            type="text"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            isInvalid={!!errors.cardHolderName}
          />
          <Form.Control.Feedback type="invalid">{errors.cardHolderName}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="cardNumber">
          <Form.Label>Card Number</Form.Label>
          <Form.Control
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            isInvalid={!!errors.cardNumber}
          />
          <Form.Control.Feedback type="invalid">{errors.cardNumber}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="expirationDate">
          <Form.Label>Expiration Date</Form.Label>
          <Form.Control
            type="text"
            placeholder="MM/YY"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            isInvalid={!!errors.expirationDate}
          />
          <Form.Control.Feedback type="invalid">{errors.expirationDate}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="cvv">
          <Form.Label>CVV</Form.Label>
          <Form.Control
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            isInvalid={!!errors.cvv}
          />
          <Form.Control.Feedback type="invalid">{errors.cvv}</Form.Control.Feedback>
        </Form.Group>

        <div className="mb-3">
          <Button type="submit">Save Card Details</Button>
        </div>
      </Form>
    </div>
  );
}
