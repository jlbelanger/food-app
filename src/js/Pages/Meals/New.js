import React, { useState } from 'react';
import { Field } from '@jlbelanger/formosa';
import Fields from './Partials/Fields';
import MetaTitle from '../../Components/MetaTitle';
import MyForm from '../../Components/MyForm';
import { useHistory } from 'react-router-dom';

export default function New() {
	const [row, setRow] = useState({});
	const [addAnother, setAddAnother] = useState(false);
	const history = useHistory();

	const afterSubmit = (response) => {
		if (addAnother) {
			setRow({});
		} else {
			history.push(`/meals/${response.id}`);
		}
	};

	return (
		<>
			<MetaTitle title="Add meal">
				<button className="formosa-button" form="add-form" type="submit">Save</button>
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
				afterSubmit={afterSubmit}
				htmlId="add-form"
				method="POST"
				path="meals"
				row={row}
				setRow={setRow}
				successToastText="Meal added successfully."
			>
				<Fields row={row} />
			</MyForm>
		</>
	);
}
