import React, { useState } from "react";
import { Auth } from "aws-amplify";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import LoaderButton from "../components/LoaderButton";
import { useAppContext } from "../libs/contextLib";
import { useFormFields } from "../libs/hooksLib";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import "./Login.css";
export default function Login() {
    const navigate = useNavigate();
    const { userHasAuthenticated } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [fields, handleFieldChange] = useFormFields({
        email: "",
        password: ""
    });
    function validateForm() {
        return fields.email.length > 0 && fields.password.length > 0;
    }
    async function handleSubmit(event) {
        event.preventDefault();
        setIsLoading(true);
        setShowOverlay(true);
        try {
            await Auth.signIn(fields.email, fields.password);
            userHasAuthenticated(true);
            navigate("/");
            const name = fields.email.split("@")[0].replace(/\d+$/, '');
            toast.success(`Welcome ${name}`);

        } catch (e) {
            toast.error(e.message);
            setIsLoading(false);
        } finally {
            setShowOverlay(false);
        }
    }
    return (
        <div className="Login">
            {showOverlay && <div className="overlay">
                <div class="spinner-grow text-light" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>}
            <motion.div
                className="Login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Form onSubmit={handleSubmit} className="shadow-lg p-3 mb-5 bg-white rounded">
                    <h1 className="text-center">Login</h1>
                    <Form.Group size="lg" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            autoFocus
                            type="email"
                            value={fields.email}
                            onChange={handleFieldChange}
                            className="rounded-pill"
                        />
                    </Form.Group>
                    <Form.Group size="lg" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={fields.password}
                            onChange={handleFieldChange}
                            className="rounded-pill"
                        />
                    </Form.Group>
                    <LoaderButton
                        block
                        size="lg"
                        type="submit"
                        isLoading={isLoading}
                        disabled={!validateForm()}
                        className="rounded-pill"
                    >
                        Login
                    </LoaderButton>
                    <Link to="/reset-password">Forgot Password ?</Link>
                    <Form.Text className="text-muted mt-3">
                        Don't have an account?{" "}
                        <Link to="/signup" className="btn-link">
                            Signup
                        </Link>
                    </Form.Text>
                </Form>
            </motion.div>
        </div>
    );
}
