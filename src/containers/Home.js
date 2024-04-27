import { BsPencilSquare } from "react-icons/bs";
import { LinkContainer } from "react-router-bootstrap";
import React, { useState, useEffect } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import { API } from "aws-amplify";
import "./Home.css";
export default function Home() {
    const [notes, setNotes] = useState([]);
    const { isAuthenticated } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);
    const [showOverlay, setShowOverlay] = useState(false)
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

    function renderNotesList(notes) {
        return (
            <>
                <LinkContainer to="/notes/new">
                    <ListGroup.Item action className="py-3 text-nowrap text-truncate">
                        <BsPencilSquare size={17} />
                        <span className="ml-2 font-weight-bold">Create a new note</span>
                    </ListGroup.Item>
                </LinkContainer>
                {notes.map(({ noteId, content, createdAt }) => (
                    <LinkContainer key={noteId} to={`/notes/${noteId}`}>
                        <ListGroup.Item action>
                            <span className="font-weight-bold">
                                {content.trim().split("\n")[0]}
                            </span>
                            <br />
                            <span className="text-muted">
                                Created: {new Date(createdAt).toLocaleString()}
                            </span>
                        </ListGroup.Item>
                    </LinkContainer>
                ))}
            </>
        );
    }
    function renderLander() {
        return (
            <div className="lander">
                <div className="background-image">
                    <div className="overlay-text">
                        <h1>Scratch</h1>
                        <p className="text-muted">A simple note taking app created by <strong>MADAN</strong></p>
                    </div>
                </div>
            </div>
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
