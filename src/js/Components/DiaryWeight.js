import { Alert, Api, Form, FormosaContext } from '@jlbelanger/formosa';
import React, { useContext } from 'react';
import DiaryWeightFieldset from './DiaryWeightFieldset';
import { errorMessageText } from '../Utilities/Helpers';
import PropTypes from 'prop-types';

export default function DiaryWeight({ date, error, setActionError, setWeight, weight }) {
	const { addToast } = useContext(FormosaContext);

	const afterSubmitFailure = (response) => {
		if (response.status !== 422) {
			setActionError(errorMessageText(response));
		}
	};

	if (error) {
		return (
			<Alert type="error" className="form">Error getting weight.</Alert>
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
			afterSubmitFailure={afterSubmitFailure}
			afterSubmitSuccess={(response, formState, setFormState) => {
				if (response.id && !weight.id) {
					setWeight({ ...weight, id: response.id });
					formState.setOriginalValue(formState, setFormState, 'id', response.id);
				}
			}}
			beforeSubmit={() => {
				setActionError(false);
				if (weight.id && weight.weight === '') {
					Api.delete(`weights/${weight.id}`)
						.catch((response) => {
							setActionError(errorMessageText(response));
						})
						.then((response) => {
							if (!response) {
								return;
							}
							addToast('Weight removed successfully.', 'success');
							setWeight({ date });
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
	setActionError: PropTypes.func.isRequired,
	setWeight: PropTypes.func.isRequired,
	weight: PropTypes.object,
};

DiaryWeight.defaultProps = {
	date: null,
	error: null,
	weight: null,
};
