import React, { useState } from 'react';
import { CheckIcon } from '@jlbelanger/formosa';
import Fields from './Partials/Fields';
import MetaTitle from '../../MetaTitle';
import MyForm from '../../MyForm';
import { useHistory } from 'react-router-dom';

export default function New() {
	const [row, setRow] = useState({});
	const [addAnother, setAddAnother] = useState(false);
	const history = useHistory();

	const onChange = (e) => {
		setAddAnother(e.target.checked);
	};

	const afterSubmit = (response) => {
		if (addAnother) {
			setRow({});
		} else {
			history.push(`/food/${response.id}`);
		}
	};

	return (
		<>
			<MetaTitle title="Add food">
				<button className="formosa-button" form="add-form" type="submit">Save</button>
				<div className="formosa-field--label-after">
					<div className="formosa-input-wrapper formosa-input-wrapper--checkbox" id="add-another-container">
						<input
							className="formosa-field__input formosa-field__input--checkbox"
							checked={addAnother}
							id="add-another"
							onChange={onChange}
							type="checkbox"
						/>
						<CheckIcon className="formosa-icon--check" height={16} width={16} />
						<div className="formosa-label-wrapper formosa-label-wrapper--checkbox">
							<label className="formosa-label" htmlFor="add-another">Add another</label>
						</div>
					</div>
				</div>
			</MetaTitle>

			<MyForm
				afterSubmit={afterSubmit}
				htmlId="add-form"
				method="POST"
				path="food"
				row={row}
				setRow={setRow}
			>
				<Fields row={row} />
			</MyForm>
		</>
	);
}
