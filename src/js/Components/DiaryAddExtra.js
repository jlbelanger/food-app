import { Field, Form } from '@jlbelanger/formosa';
import React, { useState } from 'react';
import { errorMessageText } from '../Utilities/Helpers';
import { ReactComponent as PlusIcon } from '../../svg/plus.svg';
import PropTypes from 'prop-types';

export default function DiaryAddExtra({ date, extras, setActionError, setExtras }) {
	const [row, setRow] = useState({ date });

	const afterSubmitFailure = (response) => {
		setActionError(errorMessageText(response));
	};

	return (
		<Form
			afterSubmitFailure={afterSubmitFailure}
			afterSubmitSuccess={(response) => {
				const newExtras = [...extras];
				newExtras.push({ ...response });
				setExtras(newExtras);
				setRow({ ...row, note: '' });
			}}
			beforeSubmit={() => { setActionError(false); return true; }}
			className="form"
			htmlId="extra-form"
			method="POST"
			path="extras"
			preventEmptyRequest
			row={row}
			setRow={setRow}
			successToastText="Extra added successfully."
		>
			<fieldset id="add-extras">
				<legend>Add extras</legend>
				<Field
					className="formosa-prefix"
					inputInnerWrapperClassName="flex"
					name="note"
					placeholder="Enter description"
					postfix={(
						<button className="formosa-button formosa-postfix button--secondary button--icon" type="submit">
							Add
							<PlusIcon height={16} width={16} />
						</button>
					)}
					type="text"
				/>
				<Field name="date" type="hidden" />
			</fieldset>
		</Form>
	);
}

DiaryAddExtra.propTypes = {
	date: PropTypes.string.isRequired,
	extras: PropTypes.array.isRequired,
	setActionError: PropTypes.func.isRequired,
	setExtras: PropTypes.func.isRequired,
};
