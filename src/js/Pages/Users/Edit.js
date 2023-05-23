import { Alert, Api } from '@jlbelanger/formosa';
import React, { useEffect, useState } from 'react';
import Auth from '../../Utilities/Auth';
import Error from '../../Error';
import { errorMessageText } from '../../Utilities/Helpers';
import MetaTitle from '../../Components/MetaTitle';
import Modal from '../../Components/Modal';
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
	const [deleteError, setDeleteError] = useState(false);
	const [showModal, setShowModal] = useState(false);

	const deleteRow = () => {
		setShowModal(false);
		Api.delete(`users/${row.id}`)
			.catch((response) => {
				setDeleteError(errorMessageText(response));
			})
			.then((response) => {
				if (!response) {
					return;
				}
				Auth.logout();
			});
	};

	useEffect(() => {
		Api.get(`users/${id}?fields[trackables]=name,slug&include=trackables`)
			.catch((response) => {
				setError(response);
			})
			.then((response) => {
				if (!response) {
					return;
				}
				setRow(response);
			});
	}, [id]);

	if (error) {
		return (
			<Error error={error} />
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

			{deleteError && (<Alert type="error">{deleteError}</Alert>)}

			<UserDeleteData setDeleteError={setDeleteError} user={row} />

			<p>
				<button
					className="formosa-button formosa-button--danger"
					onClick={(e) => {
						setDeleteError(false);
						setShowModal(e);
					}}
					type="button"
				>
					Delete account
				</button>
			</p>

			{showModal && (
				<Modal
					event={showModal}
					okButtonClass="formosa-button--danger"
					okButtonText="Delete"
					onClickOk={deleteRow}
					onClickCancel={() => { setShowModal(false); }}
					text="Are you sure you want to delete your account?"
				/>
			)}
		</>
	);
}
