import { Field } from '@jlbelanger/formosa';
import React from 'react';

export default function Fields() {
	return (
		<div className="formosa-responsive">
			<Field label="Name" name="name" required />
		</div>
	);
}
