import React from "react";
import { Route, Routes as Router } from "react-router-dom";
import Home from "./containers/Home";
import NotFound from "./containers/NotFound";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import NewNote from "./containers/NewNote";
import Notes from "./containers/Notes";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import PasswordReset from "./containers/PasswordReset";

export default function Routes() {
    return (
        <Router>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />}></Route>
            <Route path="/signup" element={<Signup />}></Route>
            <Route exact path="/notes/new" element={<NewNote />}></Route>
            <Route exact path="/notes/:id" element={<Notes />}>
            </Route>
            <Route path="/reset-password" element={<PasswordReset></PasswordReset>}/>
            <Route path="/login" element={<UnauthenticatedRoute><Login /></UnauthenticatedRoute>} />
            <Route path="/signup" element={<UnauthenticatedRoute><Signup /></UnauthenticatedRoute>} />
            <Route path="/notes/new" element={<AuthenticatedRoute><NewNote /></AuthenticatedRoute>} />
            <Route path="/notes/:id" element={<AuthenticatedRoute><Notes /></AuthenticatedRoute>} />
            <Route path="*" element={<NotFound></NotFound>}></Route>

        </Router>
    );
}