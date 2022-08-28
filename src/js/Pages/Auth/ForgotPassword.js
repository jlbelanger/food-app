import { Field, Form, Submit } from '@jlbelanger/formosa';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MetaTitle from '../../MetaTitle';

export default function ForgotPassword() {
	const [row, setRow] = useState({});

	return (
		<>
			<MetaTitle title="Forgot your password?" />

			<Form
				clearOnSubmit
				method="POST"
				path="auth/forgot-password"
				row={row}
				setRow={setRow}
				successMessageText="If there is an account with this email address, you will receive a password reset email shortly."
			>
				<Field
					autoComplete="email"
					label="Email"
					name="email"
					required
					type="email"
				/>

				<Submit
					label="Send link"
					postfix={(
						<Link className="formosa-button button--link" to="/">Back to login</Link>
					)}
				/>
			</Form>
		</>
	);
}
