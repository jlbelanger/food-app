import MetaTitle from './Components/MetaTitle';
import React from 'react';

export default function Error() {
	return (
		<>
			<MetaTitle title="404 Not Found" />
			<p>The requested URL was not found on this server.</p>
		</>
	);
}
