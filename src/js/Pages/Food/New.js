import React, { useState } from 'react';
import { errorMessageText } from '../../Utilities/Helpers';
import { Field } from '@jlbelanger/formosa';
import Fields from './Partials/Fields';
import MetaTitle from '../../Components/MetaTitle';
import MyForm from '../../Components/MyForm';
import { useHistory } from 'react-router-dom';

export default function New() {
	const defaultRow = { meta: { is_favourite: true } };
	const [row, setRow] = useState(defaultRow);
	const [addAnother, setAddAnother] = useState(false);
	const history = useHistory();

	const afterSubmitSuccess = (response) => {
		if (addAnother) {
			setRow(defaultRow);
		} else {
			history.push(`/food/${response.id}`);
		}
	};

	return (
		<>
			<MetaTitle title="Add food">
				<button className="formosa-button button--small" form="add-form" type="submit">Save</button>
				<Field
					label="Add another"
					labelPosition="after"
					id="add-another"
					setValue={setAddAnother}
					type="checkbox"
					value={addAnother}
				/>
			</MetaTitle>

			<MyForm
				afterSubmitSuccess={afterSubmitSuccess}
				errorMessageText={errorMessageText}
				htmlId="add-form"
				method="POST"
				path="food"
				row={row}
				setRow={setRow}
				successToastText="Food added successfully."
			>
				<Fields row={row} />
			</MyForm>
		</>
	);
}
