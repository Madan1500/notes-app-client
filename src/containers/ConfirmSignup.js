import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import { Form, FormGroup, FormControl, FormLabel, Button } from 'react-bootstrap';

export default function ConfirmSignup() {
    const location = useLocation();
    const email = location.state.email;
    const password = location.state.password;
    const [fields, setFields] = useState({
        confirmationCode: "",
    });
    const navigate = useNavigate();

    function validateConfirmationForm() {
        return fields.confirmationCode.length > 0;
    }

    function handleFieldChange(event) {
        setFields({
            ...fields,
            [event.target.id]: event.target.value
        });
    }

    async function handleConfirmationSubmit(event) {
        event.preventDefault();
        try {
            await Auth.confirmSignUp(email, fields.confirmationCode);
            await Auth.signIn(email, password);
            navigate("/");
        } catch (e) {
            alert(e.message);
        }
    }

    return (
        <Form onSubmit={handleConfirmationSubmit}>
        <FormGroup>
            <FormLabel htmlFor="confirmationCode">Confirmation Code</FormLabel>
            <FormControl
                type="tel"
                id="confirmationCode"
                onChange={handleFieldChange}
                value={fields.confirmationCode}
                placeholder="Enter confirmation code"
            />
            <Form.Text>Please check your email for the code.</Form.Text>
        </FormGroup>
        <Button
            variant="primary"
            type="submit"
            disabled={!validateConfirmationForm()}
        >
            Verify
        </Button>
    </Form>
    );
}