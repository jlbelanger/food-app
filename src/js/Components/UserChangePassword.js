import { Field, Message, Submit } from '@jlbelanger/formosa';
import React, { useState } from 'react';
import MyForm from './MyForm';
import PropTypes from 'prop-types';

export default function UserChangePassword({ user }) {
	const [row, setRow] = useState(user);

	return (
		<MyForm
			clearOnSubmit
			method="PUT"
			path={`users/${row.id}/change-password`}
			preventEmptyRequest
			row={row}
			setRow={setRow}
			showMessage={false}
			successToastText="Password changed successfully."
		>
			<h3>Change password</h3>

			<Message />

			<Field
				autoComplete="current-password"
				id="current-password-password"
				label="Current password"
				name="password"
				required
				type="password"
			/>

			<Field
				autcomplete="new-password"
				label="New password"
				name="new_password"
				required
				type="password"
			/>

			<Field
				autcomplete="new-password"
				label="Confirm new password"
				name="new_password_confirmation"
				required
				type="password"
			/>

			<Submit label="Change password" />
		</MyForm>
	);
}

UserChangePassword.propTypes = {
	user: PropTypes.object.isRequired,
};
