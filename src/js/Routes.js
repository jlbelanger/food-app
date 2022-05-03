import { Redirect, Route, Switch } from 'react-router-dom';
import Auth from './Utilities/Auth';
import Error404 from './Error404';
import ForgotPassword from './Pages/Auth/ForgotPassword';
import Login from './Pages/Auth/Login';
import Profile from './Pages/Users/Edit';
import React from 'react';
import Register from './Pages/Auth/Register';
import ResetPassword from './Pages/Auth/ResetPassword';

export default function Routes() {
	return (
		<Switch>
			<Route exact path="/">
				{Auth.isLoggedIn() ? null : <Login />}
			</Route>

			<Route exact path="/register">
				{Auth.isLoggedIn() ? <Redirect to="/" /> : <Register />}
			</Route>

			<Route exact path="/forgot-password">
				{Auth.isLoggedIn() ? <Redirect to="/" /> : <ForgotPassword />}
			</Route>

			<Route exact path="/reset-password/:token">
				{Auth.isLoggedIn() ? <Redirect to="/" /> : <ResetPassword />}
			</Route>

			<Route exact path="/profile">
				{Auth.isLoggedIn() ? <Profile /> : <Redirect to="/" />}
			</Route>

			<Route>
				<Error404 />
			</Route>
		</Switch>
	);
}
