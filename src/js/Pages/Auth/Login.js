import { Alert, Field, Form, Submit } from '@jlbelanger/formosa';
import { Link, useHistory } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Auth from '../../Utilities/Auth';
import { errorMessageText } from '../../Utilities/Helpers';
import MetaTitle from '../../Components/MetaTitle';

export default function Login() {
	const history = useHistory();
	const [row, setRow] = useState({});
	const [error, setError] = useState(false);

	const afterSubmitSuccess = (response) => {
		Auth.login(response.user, response.token, response.user.remember);
		window.location.href = process.env.PUBLIC_URL || '/';
	};

	useEffect(() => {
		const urlSearchParams = new URLSearchParams(history.location.search);
		if (urlSearchParams.get('status') === '401') {
			setError('Your session has expired. Please log in again.', 'warning');
			history.replace({ search: '' });
		}
	}, []);

	return (
		<>
			<MetaTitle title="Login" />

			<Form
				afterSubmitSuccess={afterSubmitSuccess}
				errorMessageText={(response) => (errorMessageText(response, false))}
				method="POST"
				path="auth/login"
				row={row}
				setRow={setRow}
			>
				{error && (<Alert type="error">{error}</Alert>)}

				{/* eslint-disable-next-line react/jsx-one-expression-per-line */}
				<p>For a demo, use the username <b>demo</b> and the password <b>demo</b>.</p>

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
						<Link className="formosa-button button--link" to="/forgot-password">Forgot password?</Link>
					)}
				/>
			</Form>
		</>
	);
}
