import Cookies from 'js-cookie';

export default class Auth {
	static login(user, token, remember) {
		Cookies.set(`${process.env.REACT_APP_COOKIE_PREFIX}_user`, JSON.stringify(user), Auth.attributes(remember));
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
		Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_user`);
		Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_token`);
		window.location.href = window.location.origin + process.env.PUBLIC_URL;
	}

	static id() {
		const user = Auth.user();
		return user ? JSON.parse(user).id : null;
	}

	static isAdmin() {
		const user = Auth.user();
		return user ? JSON.parse(user).is_admin : false;
	}

	static setTrackables(trackables) {
		let user = Auth.user();
		user = user ? JSON.parse(user) : [];
		user.trackables = trackables.map((trackable) => (trackable.slug));
		Cookies.set(`${process.env.REACT_APP_COOKIE_PREFIX}_user`, JSON.stringify(user)); // TODO: Remember?
	}

	static trackables() {
		const user = Auth.user();
		return user ? JSON.parse(user).trackables : [];
	}

	static user() {
		return Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_user`);
	}

	static token() {
		return Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_token`);
	}

	static isLoggedIn() {
		return !!Auth.user() && !!Auth.token();
	}
}
