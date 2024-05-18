import { BsPencilSquare } from "react-icons/bs";
import { LinkContainer } from "react-router-bootstrap";
import React, { useState, useEffect } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import { API, Storage } from "aws-amplify";
import { toast } from 'react-toastify';
import PacmanLoader from "react-spinners/PacmanLoader";
import { FaGithub } from "react-icons/fa";
import { Form, Button } from 'react-bootstrap';
import "./Home.css";
export default function Home() {
    const [notes, setNotes] = useState([]);
    const { isAuthenticated } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);
    const [showOverlay, setShowOverlay] = useState(false)
    const [selectedNotes, setSelectedNotes] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filteredNotes, setFilteredNotes] = useState([])
    const [dateInput, setDateInput] = useState("");
    useEffect(() => {
        async function onLoad() {
            if (!isAuthenticated) {
                return;
            }
            setShowOverlay(true);
            try {
                const notes = await loadNotes();
                notes.sort((a, b) => b.createdAt - a.createdAt)
                setNotes(notes);
            } catch (e) {
                onError(e);
            }
            setIsLoading(false);
            setShowOverlay(false);
        }
        onLoad();
    }, [isAuthenticated]);
    function loadNotes() {
        return API.get("notes", "/notes");
    }
    function handleSelect(noteId) {
        setSelectedNotes(prev => {
            if (prev.includes(noteId)) {
                return prev.filter(id => id !== noteId);
            } else {
                return [...prev, noteId];
            }
        });
    }
    async function deleteNote(noteId) {
        const note = await API.get("notes", `/notes/${noteId}`);
        if (note.attachment) {
            const attachmentKey = note.attachment.split('/').pop();
            await Storage.remove(attachmentKey, { level: 'private' });
        }
        return await API.del("notes", `/notes/${noteId}`);
    }

    async function handleDeleteSelected() {
        const confirmed = window.confirm(
            "Are you sure you want to delete the selected notes?"
        );
        if (!confirmed) {
            return;
        }
        setIsDeleting(true);
        try {
            setShowOverlay(true)
            for (let noteId of selectedNotes) {
                await deleteNote(noteId);
            }
            const notes = await loadNotes();
            notes.sort((a, b) => b.createdAt - a.createdAt)
            setNotes(notes);
            setSelectedNotes([]);
        } catch (e) {
            onError(e);
        } finally {
            setShowOverlay(false)
            toast.success("Deleted Successfully")
        }
        setIsDeleting(false);
    }
    function handleDateChange(event) {
        const date = event.target.value;
        setDateInput(date);
        if (date) {
            const formattedDate = new Date(date).toLocaleDateString();
            const filtered = notes.filter((note) => {
                const noteDate = new Date(note.createdAt).toLocaleDateString();
                return noteDate === formattedDate;
            });
            setFilteredNotes(filtered);
            setDateInput(date);
        } else {
            setFilteredNotes(notes);
            setDateInput('');
        }
    }

    function clearDate() {
        document.querySelector('#dateInput').value = '';
        setFilteredNotes(notes);
        setDateInput('');
    }
    function renderNotesList(notes) {
        return (
            <>
                <Form.Group className="dateForm">
                    <Form.Control
                        type="date"
                        onChange={handleDateChange}
                        className="mb-2"
                        id="dateInput"
                    />
                    {dateInput && <Button className="clear" variant="secondary" onClick={clearDate}>Clear date</Button>}
                </Form.Group>
                <LinkContainer to="/notes/new">
                    <ListGroup.Item action className="py-3 text-nowrap text-truncate">
                        <BsPencilSquare size={17} />
                        <span className="ml-2 font-weight-bold">Create a new note</span>
                    </ListGroup.Item>
                </LinkContainer>
                {
                    (() => {
                        if (dateInput && filteredNotes.length === 0) {
                            return <p className="no-notes">No notes found for this date</p>;
                        } else {
                            return (filteredNotes.length > 0 ? filteredNotes : notes).map(({ noteId, content, createdAt }) => (
                                <LinkContainer key={noteId} to={`/notes/${noteId}`}>
                                    <ListGroup.Item action>
                                        <span className="font-weight-bold">
                                            {content.trim().split("\n")[0]}
                                        </span>
                                        <br />
                                        <span className="text-muted">
                                            Created: {new Date(createdAt).toLocaleString()}
                                        </span>
                                        <input
                                            style={{ float: "right", transform: "scale(1.5)" }}
                                            type="checkbox"
                                            onClick={(event) => event.stopPropagation()}
                                            onChange={() => handleSelect(noteId)}
                                        />
                                    </ListGroup.Item>
                                </LinkContainer>
                            ))
                        }
                    })()
                }
                {selectedNotes.length > 0 && (
                    <button
                        className="btn btn-danger"
                        onClick={handleDeleteSelected}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Selected'}
                        {showOverlay && <div className="overlay">
                            <PacmanLoader color="#e01010" />
                        </div>}
                    </button>
                )}
            </>
        );
    }
    function renderLander() {
        return (<>
            <div className="lander">
                <div className="background-image">
                    <div className="overlay-text">
                        <h1>Scratch</h1>
                        <p className="text-muted">A simple note taking app created by <strong>MADAN</strong></p>
                    </div>
                </div>
            </div>
            <ListGroup.Item action className="footer">
                <a href="https://github.com/Madan1500/notes-app-client" target="_blank" rel="noopener noreferrer">
                    <FaGithub className="github-logo" />
                    <p>Github</p>
                </a>
            </ListGroup.Item>
        </>
        );
    }

    function renderNotes() {
        return (
            <div className="notes">
                <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Notes</h2>
                {(isLoading) ? <div className="notesLoader">{showOverlay && <div className="spinner-border text-info" role="status">
                    <span className="sr-only">Loading...</span>
                </div>}</div> : <ListGroup>{renderNotesList(notes)}</ListGroup>}

            </div>
        );
    }
    return (
        <div className="Home">
            {isAuthenticated ? renderNotes() : renderLander()}
        </div>
    );
}
