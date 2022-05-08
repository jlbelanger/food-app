import { Field, Submit } from '@jlbelanger/formosa';
import React, { useState } from 'react';
import Auth from '../../Utilities/Auth';
import MetaTitle from '../../MetaTitle';
import MyForm from '../../MyForm';

export default function Register() {
	const [row, setRow] = useState({});
	const afterSubmit = (response) => {
		Auth.login(response.user, response.token, response.remember);
		window.location.href = '/';
	};

	return (
		<>
			<MetaTitle title="Register" />

			<MyForm
				afterSubmit={afterSubmit}
				method="POST"
				path="auth/register"
				row={row}
				setRow={setRow}
			>
				<Field
					autoComplete="username"
					label="Username"
					name="username"
					required
					type="text"
				/>

				<Field
					autoComplete="email"
					label="Email"
					name="email"
					required
					type="email"
				/>

				<Field
					autoComplete="new-password"
					label="Password"
					name="password"
					required
					type="password"
				/>

				<Field
					autoComplete="new-password"
					label="Confirm password"
					name="password_confirmation"
					required
					type="password"
				/>

				<Submit label="Register" />
			</MyForm>
		</>
	);
}
