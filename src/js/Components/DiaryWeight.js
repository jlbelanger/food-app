import { Api, CheckIcon, Field, Form, FormosaContext } from '@jlbelanger/formosa';
import React, { useContext, useEffect, useState } from 'react';
import Auth from '../Utilities/Auth';
import PropTypes from 'prop-types';

export default function DiaryWeight({ date }) {
	const { formosaState } = useContext(FormosaContext);
	const [row, setRow] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		Api.get(`weights?filter[date][eq]=${date}`)
			.then((response) => {
				if (response.length > 0) {
					setRow(response[0]);
				} else {
					setRow({ date });
				}
			})
			.catch(() => {
				setError(true);
			});
	}, [date]);

	if (error) {
		return (
			<p className="formosa-message formosa-message--error">Error getting weight.</p>
		);
	}

	return (
		<Form
			beforeSubmit={() => {
				if (row.id && row.weight === '') {
					Api.delete(`weights/${row.id}`)
						.then(() => {
							formosaState.addToast('Weight saved successfully.', 'success');
							setRow({});
						})
						.catch((response) => {
							const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
							formosaState.addToast(text, 'error', 10000);
						});
					return false;
				}
				return true;
			}}
			htmlId="weight-form"
			id={row && row.id ? row.id : null}
			method={row && row.id ? 'PUT' : 'POST'}
			path="weights"
			preventEmptyRequest
			row={row}
			setRow={setRow}
			successToastText="Weight saved successfully."
		>
			<fieldset>
				<legend>Weight</legend>
				<Field
					className="formosa-prefix"
					inputWrapperClassName="flex"
					maxLength={6}
					name="weight"
					postfix={(
						<button className="formosa-button formosa-postfix button--icon" type="submit">
							Save
							<CheckIcon height={16} width={16} />
						</button>
					)}
					size={5}
					suffix={Auth.weightUnits()}
				/>
			</fieldset>
		</Form>
	);
}

DiaryWeight.propTypes = {
	date: PropTypes.string,
};

DiaryWeight.defaultProps = {
	date: null,
};
