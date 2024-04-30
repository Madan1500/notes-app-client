import React, { useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";
import { API } from "aws-amplify";
import config from "../config";
import { s3Upload } from "../libs/awsLib";
import {FaArrowCircleLeft} from "react-icons/fa";
import { Link } from "react-router-dom";
import FadeLoader from "react-spinners/FadeLoader"
import "./NewNote.css";
export default function NewNote() {
    const file = useRef(null);
    const navigate = useNavigate();
    const [previewImage, setPreviewImage] = useState(null);
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [overlay,setOverlay]= useState(false)
    const [attachment,setAttachment]=useState(false)
    const [imageName, setImageName] = useState("");
    function validateForm() {
        return content.length > 0;
    }
    function handleFileChange(event) {
        if (event.target.files.length > 0) {
            file.current = event.target.files[0];
            setPreviewImage(URL.createObjectURL(file.current));
            setImageName(file.current.name);
            setAttachment(true);
        }
    }
    async function handleSubmit(event) {
        event.preventDefault();
        if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
            alert(
                `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 1000000
                } MB.`
            );
            return;
        }
        setIsLoading(true);
        setOverlay(true)
        try {
            const attachment = file.current ? await s3Upload(file.current) : null;
            await createNote({ content, attachment });
            navigate("/");
        } catch (e) {
            onError(e); 
            setIsLoading(false);
        } finally {
            setOverlay(false)
        }
    }
    function createNote(note) {
        return API.post("notes", "/notes", {
            body: {
                ...note, 
                content: note.content.trim() 
            }
        });
    }

    return (
        <div className="NewNote">
            <Form onSubmit={handleSubmit}>
            <Link to={"/"} className="back"><FaArrowCircleLeft /></Link>
                <Form.Group controlId="content">
                    <Form.Control
                        value={content}
                        as="textarea"
                        placeholder="Enter text here to save..."
                        onChange={(e) => setContent(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="file">
                    <Form.Label>{attachment?"Attachment":"Add Attachment"}</Form.Label>
                    <Form.Control onChange={handleFileChange} type="file" />
                    {attachment?<p className="selectedImageName">{imageName}</p>:<></>}
                    {previewImage && (
                        <img
                            src={previewImage}
                            alt="Preview"
                            style={{ maxWidth: '100%', height: '200px', objectFit: 'contain',float: 'right'}}
                        />
                    )}
                </Form.Group>
                <LoaderButton
                    block
                    type="submit"
                    size="lg"
                    variant="primary"
                    isLoading={isLoading}
                    disabled={!validateForm()}>
                    Create
                </LoaderButton>
            </Form>
            {overlay && <div className="overlay"><FadeLoader color={"#36d7b7"} /></div>}
        </div>
    );
}
