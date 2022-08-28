import React, { useContext } from 'react';
import { FormContext } from '@jlbelanger/formosa';
import { Prompt } from 'react-router-dom';

export default function MyFormPrompt() {
	const { formState } = useContext(FormContext);
	return (
		<Prompt
			when={formState.dirtyKeys(formState).length > 0}
			message="You have unsaved changes. Are you sure you want to leave this page?"
		/>
	);
}
