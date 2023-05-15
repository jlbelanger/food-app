import { Api, FormosaContext } from '@jlbelanger/formosa';
import React, { useContext, useEffect, useState } from 'react';
import Auth from '../../Utilities/Auth';
import Error from '../../Error';
import MetaTitle from '../../Components/MetaTitle';
import Modal from '../../Components/Modal';
import { useHistory } from 'react-router-dom';
import UserBmi from '../../Components/UserBmi';
import UserChangeEmail from '../../Components/UserChangeEmail';
import UserChangePassword from '../../Components/UserChangePassword';
import UserChangeUsername from '../../Components/UserChangeUsername';
import UserDeleteData from '../../Components/UserDeleteData';
import UserTrackables from '../../Components/UserTrackables';

export default function Edit() {
	const { addToast } = useContext(FormosaContext);
	const id = Auth.id();
	const [row, setRow] = useState(null);
	const [error, setError] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const history = useHistory();

	const onClickDelete = () => {
		setShowModal(false);
		Api.delete(`users/${row.id}`)
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				addToast(text, 'error', 10000);
				throw response;
			})
			.then(() => {
				Auth.logout(history);
			});
	};

	useEffect(() => {
		Api.get(`users/${id}?fields[trackables]=name,slug&include=trackables`)
			.catch((response) => {
				setError(response);
				throw response;
			})
			.then((response) => {
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

			<UserDeleteData user={row} />

			<p>
				<button className="formosa-button formosa-button--danger" onClick={(e) => { setShowModal(e); }} type="button">
					Delete account
				</button>
			</p>

			{showModal && (
				<Modal
					event={showModal}
					okButtonClass="formosa-button--danger"
					okButtonText="Delete"
					onClickOk={onClickDelete}
					onClickCancel={() => { setShowModal(false); }}
					text="Are you sure you want to delete your account?"
				/>
			)}
		</>
	);
}
