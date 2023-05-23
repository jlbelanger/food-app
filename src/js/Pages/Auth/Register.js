import { Field, Submit } from '@jlbelanger/formosa';
import React, { useState } from 'react';
import Auth from '../../Utilities/Auth';
import { errorMessageText } from '../../Utilities/Helpers';
import MetaTitle from '../../Components/MetaTitle';
import MyForm from '../../Components/MyForm';

export default function Register() {
	const [row, setRow] = useState({});
	const afterSubmitSuccess = (response) => {
		Auth.login(response.user, response.token, response.user.remember);
		window.location.href = process.env.PUBLIC_URL || '/';
	};

	return (
		<>
			<MetaTitle title="Register" />

			<MyForm
				afterSubmitSuccess={afterSubmitSuccess}
				errorMessageText={errorMessageText}
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
