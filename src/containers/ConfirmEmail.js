import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { Auth } from 'aws-amplify';
import { toast } from 'react-toastify';
import { FadeLoader } from 'react-spinners';

function ConfirmEmail() {
  const [otp, setOtp] = useState("");
  const [isEmailUpdated, setIsEmailUpdated] = useState(false);
  const [overlay, setOverlay] = useState(false)
  const navigate = useNavigate();
  const location = useLocation();
  const { email, newEmail } = location.state || {};

  useEffect(() => {
    if (!email || !newEmail) {
      navigate('/forgot-email');
    }
  }, [email, newEmail, navigate]);

  const handleSubmitOtp = async (e) => {
    e.preventDefault();
    try {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.updateUserAttributes(user, {
        email: newEmail,
      });
      setIsEmailUpdated(true);
      setOtp("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setOverlay(true)
      await Auth.verifyCurrentUserAttributeSubmit('email', otp);
      toast.success("Email verified successfully");
      setOtp("")
      // You can navigate or perform any other action after successful email verification
      navigate("/")
    } catch (error) {
      toast.error(error.message);
    } finally {
      setOverlay(false)
    }
  };

  return (
    <>
      <Container>
        <Row className="justify-content-md-center">
          <Col md={6}>
            <Form onSubmit={isEmailUpdated ? handleVerifyOtp : handleSubmitOtp} style={{ backgroundColor: '#2e2a2a', padding: '30px' }}>
              <Form.Group size="lg" controlId="otp">
                <Form.Label>{isEmailUpdated ? 'New Email OTP' : 'Current Email OTP'}</Form.Label>
                <Form.Control
                  autoFocus
                  type="text"
                  value={otp}
                  className="rounded-pill"
                  onChange={(e) => setOtp(e.target.value)}
                />
              </Form.Group>
              {isEmailUpdated ? (
                <Button block size="lg" type="submit">
                  Verify OTP
                </Button>
              ) : (
                <Button block size="lg" type="submit">
                  Submit OTP
                </Button>
              )}
            </Form>
          </Col>
        </Row>
      </Container>
      {overlay && <div className="overlay"><FadeLoader color={"#36d7b7"} /></div>}
    </>
  );
}

export default ConfirmEmail;