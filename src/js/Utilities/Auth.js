import Cookies from 'js-cookie';

export default class Auth {
	static login(id, token, remember) {
		Cookies.set(`${process.env.REACT_APP_COOKIE_PREFIX}_id`, id, Auth.attributes(remember));
		Cookies.set(`${process.env.REACT_APP_COOKIE_PREFIX}_token`, token, Auth.attributes(remember));
	}

	static attributes(remember) {
		const attributes = {};
		if (remember) {
			attributes.expires = 365;
		}
		if (window.location.protocol === 'https:') {
			attributes.secure = true;
		}
		return attributes;
	}

	static logout() {
		Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_id`);
		Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_token`);
		window.location.href = window.location.origin + process.env.PUBLIC_URL;
	}

	static id() {
		return Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_id`);
	}

	static token() {
		return Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_token`);
	}

	static isLoggedIn() {
		return !!Auth.id() && !!Auth.token();
	}
}
