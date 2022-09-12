import { Api, Form, FormosaContext } from '@jlbelanger/formosa';
import React, { useContext, useEffect, useState } from 'react';
import DiaryWeightFieldset from './DiaryWeightFieldset';
import PropTypes from 'prop-types';

export default function DiaryWeight({ date }) {
	const { addToast } = useContext(FormosaContext);
	const [row, setRow] = useState(null);
	const [rowId, setRowId] = useState(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		Api.get(`weights?filter[date][eq]=${date}`)
			.then((response) => {
				if (response.length > 0) {
					setRow(response[0]);
					setRowId(response[0].id);
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
			<p className="formosa-message formosa-message--error form">Error getting weight.</p>
		);
	}

	if (row === null) {
		return (
			<Form className="form" key="fake-form">
				<DiaryWeightFieldset disabled />
			</Form>
		);
	}

	return (
		<Form
			afterSubmit={(response) => {
				if (response.id) {
					setRowId(response.id);
				}
			}}
			beforeSubmit={() => {
				if (rowId && row.weight === '') {
					Api.delete(`weights/${rowId}`)
						.then(() => {
							addToast('Weight removed successfully.', 'success');
							setRow({ date });
							setRowId(null);
						})
						.catch((response) => {
							const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
							addToast(text, 'error', 10000);
						});
					return false;
				}
				return true;
			}}
			className="form"
			htmlId="weight-form"
			id={rowId}
			key="real-form"
			method={rowId ? 'PUT' : 'POST'}
			path="weights"
			preventEmptyRequest
			row={row}
			setRow={setRow}
			successToastText="Weight saved successfully."
		>
			<DiaryWeightFieldset />
		</Form>
	);
}

DiaryWeight.propTypes = {
	date: PropTypes.string,
};

DiaryWeight.defaultProps = {
	date: null,
};
