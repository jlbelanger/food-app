import { Form } from '@jlbelanger/formosa';
import MyFormPrompt from './MyFormPrompt';
import PropTypes from 'prop-types';
import React from 'react';

export default function MyForm({
	children,
	...otherProps
}) {
	return (
		<Form {...otherProps}>
			{children}
			<MyFormPrompt />
		</Form>
	);
}

MyForm.propTypes = {
	children: PropTypes.node.isRequired,
};
