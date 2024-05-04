import React, { useState } from 'react';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { toast } from 'react-toastify';

function ForgotEmail() {
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const navigate = useNavigate();

  const handleRetrieveEmail = async (e) => {
    e.preventDefault();
    try {
      await Auth.forgotPassword(email);
      toast.success(`Verification code sent to ${email}`);
      navigate('/confirmEmail', { state: { email, newEmail } });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Form onSubmit={handleRetrieveEmail} style={{ backgroundColor: '#2e2a2a', padding:"30px" }}>
            <Form.Group size="lg" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                autoFocus
                type="email"
                value={email}
                className="rounded-pill"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group size="lg" controlId="newEmail">
              <Form.Label>New Email</Form.Label>
              <Form.Control
                type="email"
                value={newEmail}
                className="rounded-pill"
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </Form.Group>
            <Button block size="lg" type="submit">
              Retrieve Email
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotEmail;