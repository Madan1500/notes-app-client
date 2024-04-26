import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import { onError } from '../libs/errorLib';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import "./PasswordReset.css"

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reset, setReset] = useState(false);
  const navigate=useNavigate()

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await Auth.forgotPassword(email);
      setReset(true);
    } catch (error) {
      onError(error.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      onError("Passwords do not match");
      return;
    }
    try {
      await Auth.forgotPasswordSubmit(email, code, password);
      toast.success("Password reset successfully");
      navigate("/login")
      
    } catch (error) {
      onError(error.message);
    }
  };

  return (
    <div className='forgotPassword'>
    <Form onSubmit={reset ? handleResetPassword : handleForgotPassword} className="shadow-lg p-3 mb-5 bg-white rounded forgotPasswordForm">
    <h1 className="text-center">{reset ? 'Reset Password' : 'Forgot Password'}</h1>
    <Form.Group size="lg" controlId="email">
      <Form.Label className='forgotPassworLabels'>Email</Form.Label>
      <Form.Control
        autoFocus
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Enter your registered emaiId'
        className="rounded-pill"
        required
      />
    </Form.Group>
    {reset && (
      <>
        <Form.Group size="lg" controlId="code">
          <Form.Label className='forgotPassworLabels'>Verification Code</Form.Label>
          <Form.Control
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="rounded-pill"
            placeholder='Enter the Verification Code sent to your EmailId'
            required
          />
        </Form.Group>
        <Form.Group size="lg" controlId="password">
          <Form.Label className='forgotPassworLabels'>New Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-pill"
            placeholder='Enter your new Password'
            required
          />
        </Form.Group>
        <Form.Group size="lg" controlId="confirmPassword">
          <Form.Label className='forgotPassworLabels'>Confirm New Password</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-pill"
            placeholder='Confirm your new Password'
            required
          />
        </Form.Group>
      </>
    )}
    <Button block size="lg" type="submit" className="rounded-pill">
      {reset ? 'Reset password' : 'Submit'}
    </Button>
    {!reset && <Link to="/login">Back to Login</Link>}
  </Form>
  </div>
  );
};

export default PasswordReset;
