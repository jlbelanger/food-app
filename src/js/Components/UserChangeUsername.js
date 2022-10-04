import { Field, Message, Submit } from '@jlbelanger/formosa';
import React, { useState } from 'react';
import MyForm from './MyForm';
import PropTypes from 'prop-types';

export default function UserChangeUsername({ user }) {
	const [row, setRow] = useState(user);

	return (
		<MyForm
			id={row.id}
			method="PUT"
			path="users"
			preventEmptyRequest
			row={row}
			setRow={setRow}
			showMessage={false}
			successToastText="Username changed successfully."
		>
			<h3>Change username</h3>

			<Message />

			<Field
				autoComplete="username"
				label="Username"
				name="username"
				required
			/>

			<Submit label="Change username" />
		</MyForm>
	);
}

UserChangeUsername.propTypes = {
	user: PropTypes.object.isRequired,
};
