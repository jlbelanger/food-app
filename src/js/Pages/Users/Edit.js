import { Api, Form, Message, Submit } from '@jlbelanger/formosa';
import React, { useEffect, useState } from 'react';
import Auth from '../../Utilities/Auth';
import Error from '../../Error';
import MetaTitle from '../../Components/MetaTitle';
import UserBmi from '../../Components/UserBmi';
import UserChangeEmail from '../../Components/UserChangeEmail';
import UserChangePassword from '../../Components/UserChangePassword';
import UserChangeUsername from '../../Components/UserChangeUsername';
import UserDeleteData from '../../Components/UserDeleteData';
import UserTrackables from '../../Components/UserTrackables';

export default function Edit() {
	const id = Auth.id();
	const [row, setRow] = useState(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		Api.get(`users/${id}?fields[trackables]=name,slug&include=trackables`)
			.then((response) => {
				setRow(response);
			})
			.catch((response) => {
				setError(response.status);
			});
	}, [id]);

	if (error) {
		return (
			<Error status={error} />
		);
	}

	if (row === null) {
		return (
			<MetaTitle title="Profile" />
		);
	}

	return (
		<>
			<MetaTitle title="Profile" />

			<UserBmi user={row} />

			<hr />

			<UserTrackables user={row} />

			<hr />

			<h2>Account</h2>
			<UserChangeUsername user={row} />
			<hr />
			<UserChangeEmail user={row} />
			<hr />
			<UserChangePassword user={row} />

			<hr />

			<h3>Delete data</h3>

			<UserDeleteData user={row} />

			<Form
				afterSubmit={() => {
					Auth.logout();
				}}
				beforeSubmit={() => (
					confirm('Are you sure you want to delete your account?') // eslint-disable-line no-restricted-globals
				)}
				id={row.id}
				method="DELETE"
				path="users"
				showMessage={false}
			>
				<Message />

				<Submit className="formosa-button--danger" label="Delete account" />
			</Form>
		</>
	);
}
