import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import { onError } from "../libs/errorLib";
import Form from "react-bootstrap/Form";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./Notes.css";
import { s3Upload } from "../libs/awsLib";
import { Link } from "react-router-dom";
import { FaArrowCircleLeft } from "react-icons/fa";

export default function Notes() {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const file = useRef(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState(null);
    const [content, setContent] = useState("");
    useEffect(() => {
        async function loadNote() {
            return API.get("notes", `/notes/${id}`);
        }
        async function onLoad() {
            try {
                const note = await loadNote();
                const { content, attachment } = note;
                if (attachment) {
                    note.attachmentURL = await Storage.vault.get(attachment);
                }
                setContent(content);
                setNote(note);
            } catch (e) {
                onError(e);
            }
        }
        onLoad();
    }, [id]);
    function validateForm() {
        return content.length > 0;
    }
    function formatFilename(str) {
        return str.replace(/^\w+-/, "");
    }
    function updateNote(attachment) {
        return API.put("notes", `/notes/${id}`, {
            body: {
                attachment,
                content
            }
        });
    }
    async function handleFileChange(event) {
        file.current = null;
        file.current = event.target.files[0];
        setIsLoading(true);
        try {
            if (file.current) {
                const reader = new FileReader();
                reader.onloadend = function() {
                    setNote(prevState => ({
                        ...prevState,
                        attachmentURL: reader.result
                    }));
                }
                reader.readAsDataURL(file.current);
            }
        } catch (e) {
            onError(e);
        }
    
        setIsLoading(false);
    }
    function saveNote(note) {
        return API.put("notes", `/notes/${id}`, {
            body: note
        });
    }
    async function handleSave() {
        setIsLoading(true);
    
        try {
            if (file.current) {
                const attachment = await s3Upload(file.current);
                const attachmentURL = await Storage.vault.get(attachment);
                await updateNote(attachment);
                setNote(prevState => ({
                    ...prevState,
                    attachmentURL
                }));
            }
        } catch (e) {
            onError(e);
        }
    
        setIsLoading(false);
    }
    async function handleSubmit(event) {
        let attachment;
        event.preventDefault();
        if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
            alert(
                `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 1000000
                } MB.`
            );
            return;
        }
        setIsLoading(true);
        try {
            if (file.current) {
                attachment = await s3Upload(file.current);
            } await saveNote({
                content,
                attachment: attachment || note.attachment
            });
            await handleSave();
            navigate("/");
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }


    function deleteNote() {
        return API.del("notes", `/notes/${id}`);
    }
    async function handleDelete(event) {
        event.preventDefault();
        const confirmed = window.confirm(
            "Are you sure you want to delete this note?"
        );
        if (!confirmed) {
            return;
        }
        setIsDeleting(true);
        try {
            await deleteNote();
            navigate("/");
        } catch (e) {
            onError(e);
            setIsDeleting(false);
        }
    }

    return (
        <div className="Notes">
            {note && (
                <Form onSubmit={handleSubmit}>
                    <Link to={"/"} className="back"><FaArrowCircleLeft /></Link>
                    <Form.Group controlId="content">
                        <Form.Control
                            as="textarea"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </Form.Group>
                    {note.attachmentURL && (
                        <img src={note.attachmentURL}
                            alt="Note attachment"
                            style={{
                                maxWidth: '100%',
                                height: '200px',
                                objectFit: 'contain'
                            }} />
                    )}
                    <Form.Group controlId="file">
                        <Form.Label>Attachment</Form.Label>
                        {note.attachment && (
                            <p>
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={note.attachmentURL}
                                >{formatFilename(note.attachment)}
                                </Link>
                            </p>
                        )}
                        <Form.Control onChange={handleFileChange} type="file" />
                    </Form.Group>
                    <LoaderButton
                        block
                        size="lg"
                        type="submit"
                        isLoading={isLoading}
                        disabled={!validateForm()}
                    >
                        Save
                    </LoaderButton>
                    <LoaderButton
                        block
                        size="lg"
                        variant="danger"
                        onClick={handleDelete}
                        isLoading={isDeleting}
                    >
                        Delete
                    </LoaderButton>
                </Form>
            )}
        </div>
    );

}