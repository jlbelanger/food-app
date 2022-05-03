import { React, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function MetaTitle({ title }) {
	useEffect(() => {
		let metaTitle = title;
		if (process.env.REACT_APP_TITLE) {
			if (metaTitle) {
				metaTitle += ' | ';
			}
			metaTitle += process.env.REACT_APP_TITLE;
		}
		document.querySelector('title').innerText = metaTitle;
		return () => {};
	}, [title]);

	return (
		<h1>{title}</h1>
	);
}

MetaTitle.propTypes = {
	title: PropTypes.string,
};

MetaTitle.defaultProps = {
	title: '',
};
