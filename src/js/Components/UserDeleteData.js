import { Api, Field, Form, FormosaContext, Submit } from '@jlbelanger/formosa';
import React, { useContext, useState } from 'react';

export default function UserDeleteData() {
	const { addToast } = useContext(FormosaContext);
	const [types, setTypes] = useState([]);

	return (
		<Form
			onSubmit={(e) => {
				e.preventDefault();

				if (!confirm('Are you sure you want to delete this data?')) { // eslint-disable-line no-restricted-globals
					return;
				}

				Api.post('users/delete-data', JSON.stringify({ types }))
					.then(() => {
						addToast('Data deleted successfully.', 'success');
					})
					.catch((response) => {
						const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
						addToast(text, 'error', 10000);
					});
			}}
		>
			<Field
				fieldsetClassName="radio-list"
				options={['entries', 'meals', 'weights']}
				name="types"
				value={types}
				setValue={setTypes}
				type="checkbox-list"
			/>

			<Submit className="formosa-button--danger" label="Delete selected data" />
		</Form>
	);
}
