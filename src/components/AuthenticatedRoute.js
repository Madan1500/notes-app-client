import React from 'react';
import { Route, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../libs/contextLib';

export default function AuthenticatedRoute({ children, ...rest }) {
  const { pathname, search } = useLocation();
  const { isAuthenticated } = useAppContext();
  const navigate = useNavigate();

  return (
    <Route {...rest}>
      {isAuthenticated ? (
        children
      ) : (
        navigate(`/login?redirect=${pathname}${search}`)
      )}
    </Route>
  );
}

