import { Field, FormAlert, Submit } from '@jlbelanger/formosa';
import React, { useState } from 'react';
import { errorMessageText } from '../Utilities/Helpers';
import MyForm from './MyForm';
import PropTypes from 'prop-types';

export default function UserChangeEmail({ user }) {
	const [row, setRow] = useState(user);

	return (
		<MyForm
			errorMessageText={errorMessageText}
			method="PUT"
			path={`users/${row.id}/change-email`}
			preventEmptyRequest
			row={row}
			setRow={setRow}
			showMessage={false}
			successToastText="Email changed successfully."
		>
			<h3>Change email</h3>

			<FormAlert />

			<Field
				autoComplete="email"
				label="Email"
				name="email"
				required
				type="email"
			/>

			<Field
				autoComplete="current-password"
				id="current-password-email"
				label="Current password"
				name="password"
				required
				type="password"
			/>

			<Submit label="Change email" />
		</MyForm>
	);
}

UserChangeEmail.propTypes = {
	user: PropTypes.object.isRequired,
};
