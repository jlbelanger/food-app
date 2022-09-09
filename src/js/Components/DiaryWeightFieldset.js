import { CheckIcon, Field } from '@jlbelanger/formosa';
import Auth from '../Utilities/Auth';
import PropTypes from 'prop-types';
import React from 'react';

export default function DiaryWeightFieldset({ disabled }) {
	return (
		<fieldset>
			<legend>Weight</legend>
			<Field
				className="formosa-prefix"
				disabled={disabled}
				id={disabled ? 'fake-weight' : 'weight'}
				inputInnerWrapperClassName="flex"
				maxLength={6}
				name="weight"
				postfix={(
					<button className="formosa-button formosa-postfix button--icon" disabled={disabled} type="submit">
						Save
						<CheckIcon height={16} width={16} />
					</button>
				)}
				size={5}
				suffix={Auth.weightUnits()}
			/>
		</fieldset>
	);
}

DiaryWeightFieldset.propTypes = {
	disabled: PropTypes.bool,
};

DiaryWeightFieldset.defaultProps = {
	disabled: false,
};
