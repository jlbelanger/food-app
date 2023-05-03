import { Api, Form, FormosaContext } from '@jlbelanger/formosa';
import React, { useContext } from 'react';
import DiaryWeightFieldset from './DiaryWeightFieldset';
import PropTypes from 'prop-types';

export default function DiaryWeight({ date, error, setWeight, weight }) {
	const { addToast } = useContext(FormosaContext);

	if (error) {
		return (
			<p className="formosa-message formosa-message--error form">Error getting weight.</p>
		);
	}

	if (weight === null) {
		return (
			<Form className="form" key="fake-form">
				<DiaryWeightFieldset disabled />
			</Form>
		);
	}

	return (
		<Form
			afterSubmit={(response, formState, setFormState) => {
				if (response.id && !weight.id) {
					setWeight({ ...weight, id: response.id });
					formState.setOriginalValue(formState, setFormState, 'id', response.id);
				}
			}}
			beforeSubmit={() => {
				if (weight.id && weight.weight === '') {
					Api.delete(`weights/${weight.id}`)
						.then(() => {
							addToast('Weight removed successfully.', 'success');
							setWeight({ date });
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
			id={weight && weight.id ? weight.id : null}
			key="real-form"
			method={weight && weight.id ? 'PUT' : 'POST'}
			path="weights"
			preventEmptyRequest
			row={weight}
			setRow={(value) => {
				setWeight(value);
			}}
			successToastText="Weight saved successfully."
		>
			<DiaryWeightFieldset />
		</Form>
	);
}

DiaryWeight.propTypes = {
	date: PropTypes.string,
	error: PropTypes.object,
	setWeight: PropTypes.func.isRequired,
	weight: PropTypes.object,
};

DiaryWeight.defaultProps = {
	date: null,
	error: null,
	weight: null,
};
