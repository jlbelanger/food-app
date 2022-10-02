import { Field, Form } from '@jlbelanger/formosa';
import React, { useState } from 'react';
import { ReactComponent as PlusIcon } from '../../svg/plus.svg';
import PropTypes from 'prop-types';

export default function DiaryAddExtra({ date, diary, setDiary }) {
	const [row, setRow] = useState({ date });

	return (
		<Form
			afterSubmit={(response) => {
				const newExtras = [...diary.extras];
				newExtras.push({ ...response });
				setDiary({ ...diary, extras: newExtras });
				setRow({ ...row, note: '' });
			}}
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
						<button className="formosa-button formosa-postfix button--tertiary button--icon" type="submit">
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
	diary: PropTypes.object.isRequired,
	setDiary: PropTypes.func.isRequired,
};
