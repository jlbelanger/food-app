import { Field, Form, Submit } from '@jlbelanger/formosa';
import React, { useState } from 'react';
import Auth from '../../Utilities/Auth';
import MetaTitle from '../../MetaTitle';
import { NavLink } from 'react-router-dom';

export default function Login() {
	const [row, setRow] = useState({});

	const afterSubmit = (response) => {
		Auth.login(response.id, response.token, response.remember);
		window.location.reload();
	};

	return (
		<>
			<MetaTitle title="Login" />

			<Form
				afterSubmit={afterSubmit}
				method="POST"
				path="auth/login"
				row={row}
				setRow={setRow}
			>
				<Field
					autoCapitalize="none"
					autoComplete="username"
					label="Username"
					name="username"
					required
					type="text"
				/>

				<Field
					autoComplete="current-password"
					label="Password"
					name="password"
					required
					type="password"
				/>

				<Field
					label="Remember me"
					labelPosition="after"
					name="remember"
					type="checkbox"
				/>

				<Submit
					label="Log in"
					postfix={(
						<NavLink className="formosa-button button--link" to="/forgot-password">Forgot your password?</NavLink>
					)}
				/>
			</Form>
		</>
	);
}
