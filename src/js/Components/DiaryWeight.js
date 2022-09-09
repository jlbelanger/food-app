import { Api, Form, FormosaContext } from '@jlbelanger/formosa';
import React, { useContext, useEffect, useState } from 'react';
import DiaryWeightFieldset from './DiaryWeightFieldset';
import PropTypes from 'prop-types';

export default function DiaryWeight({ date }) {
	const { addToast } = useContext(FormosaContext);
	const [row, setRow] = useState(null);
	const [error, setError] = useState(false);

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
					setRow({ ...row, id: response.id, type: response.type });
				}
			}}
			beforeSubmit={() => {
				if (row.id && row.weight === '') {
					Api.delete(`weights/${row.id}`)
						.then(() => {
							addToast('Weight removed successfully.', 'success');
							setRow({ date });
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
			id={row.id ? row.id : null}
			key="real-form"
			method={row.id ? 'PUT' : 'POST'}
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
