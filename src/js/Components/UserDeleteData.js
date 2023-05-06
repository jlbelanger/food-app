import { Api, Field, FormosaContext } from '@jlbelanger/formosa';
import React, { useContext, useState } from 'react';
import Modal from './Modal';

export default function UserDeleteData() {
	const { addToast } = useContext(FormosaContext);
	const [types, setTypes] = useState([]);
	const [showModal, setShowModal] = useState(false);

	const onClickOk = () => {
		setShowModal(false);
		Api.post('users/delete-data', JSON.stringify({ types }))
			.then(() => {
				addToast('Data deleted successfully.', 'success');
			})
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				addToast(text, 'error', 10000);
			});
	};

	return (
		<>
			<Field
				fieldsetClassName="radio-list"
				options={['entries', 'meals', 'weights']}
				name="types"
				value={types}
				setValue={setTypes}
				type="checkbox-list"
			/>

			<p>
				<button className="formosa-button formosa-button--danger" onClick={(e) => { setShowModal(e); }} type="button">
					Delete selected data
				</button>
			</p>

			{showModal && (
				<Modal
					event={showModal}
					okButtonClass="formosa-button--danger"
					okButtonText="Delete"
					onClickOk={onClickOk}
					onClickCancel={() => { setShowModal(false); }}
					text="Are you sure you want to delete this data?"
				/>
			)}
		</>
	);
}
