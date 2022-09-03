import { Error, Field, Input, Label } from '@jlbelanger/formosa';
import React, { useEffect, useRef } from 'react';
import Auth from '../../../Utilities/Auth';
import PropTypes from 'prop-types';

export default function Fields({ readOnly, row }) {
	const image = useRef(null);

	const onScroll = () => {
		if (!image || !image.current) {
			return;
		}

		const imageTop = image.current.getAttribute('data-sticky-offset-top');
		const headerHeight = 88;
		const margin = 8;
		const threshold = imageTop - headerHeight - margin;
		if (window.pageYOffset >= threshold) {
			image.current.classList.add('sticky');
		} else {
			image.current.classList.remove('sticky');
		}
	};

	const onResize = () => {
		if (!image || !image.current) {
			return;
		}

		image.current.classList.remove('sticky');
		image.current.setAttribute('data-sticky-offset-top', image.current.offsetTop);
		image.current.style.right = `${window.innerWidth - image.current.offsetLeft - image.current.scrollWidth}px`;
		onScroll();
	};

	useEffect(() => {
		window.addEventListener('resize', onResize);
		window.addEventListener('scroll', onScroll);
		return () => {
			window.removeEventListener('resize', onResize);
			window.removeEventListener('scroll', onScroll);
		};
	}, []);

	useEffect(() => {
		if (image && image.current) {
			onResize();
			onScroll();
		}
	}, [row.info_image]);

	const toSlug = (value) => {
		if (!value) {
			return '';
		}
		return value.toLowerCase()
			.replace(/ & /g, '-and-')
			.replace(/<[^>]+>/g, '')
			.replace(/['’.]/g, '')
			.replace(/[^a-z0-9-]+/g, '-')
			.replace(/^-+/, '')
			.replace(/-+$/, '')
			.replace(/--+/g, '-');
	};

	const autopopulate = (e, theRow) => {
		if (!theRow.name) {
			return { slug: '' };
		}
		return { slug: toSlug(theRow.name) };
	};

	const isVisible = (attribute) => (!readOnly || row[attribute] !== null);

	const servingSizeDisabled = !!row.id;
	const attributes = {
		className: 'nutrition-facts__input',
		inputMode: 'numeric',
		labelClassName: 'nutrition-facts__label',
		pattern: '[0-9.]*',
		readOnly,
		size: 4,
	};
	const attributesSection = { ...attributes, labelClassName: 'nutrition-facts__label nutrition-facts__label--section' };
	const attributesVitamin = { ...attributes, labelClassName: 'nutrition-facts__label nutrition-facts__label--vitamin' };
	const src = row.front_image ? `${process.env.REACT_APP_API_URL}${row.front_image}` : null;

	let infoImageSrc = null;
	let infoImageLink = null;
	if (row.info_image) {
		if (typeof row.info_image === 'object') {
			infoImageSrc = URL.createObjectURL(row.info_image);
		} else if (typeof row.info_image === 'string') {
			infoImageSrc = `${process.env.REACT_APP_API_URL}${row.info_image}`;
			infoImageLink = infoImageSrc;
		}
	}

	return (
		<>
			{readOnly && src && (
				<p className="center">
					<a href={src} id="front-image" rel="noreferrer" target="_blank">
						<img alt="" height={200} src={src} />
					</a>
				</p>
			)}

			{!readOnly && (
				<div className="formosa-responsive">
					{Auth.getValue('is_admin') && <Field label="User ID" name="user.id" size={5} />}
					<Field afterChange={autopopulate} label="Name" name="name" readOnly={readOnly} required />
					<Field label="Slug" name="slug" readOnly required />
					<Field
						accept="image/*"
						label="Front image"
						imagePrefix={process.env.REACT_APP_API_URL}
						imagePreview
						imageHeight={200}
						linkAttributes={{ rel: 'noreferrer', target: '_blank' }}
						linkImage
						name="front_image"
						note="Upload a photo of the front of the package."
						readOnly={readOnly}
						type="file"
					/>
					<Field
						accept="image/*"
						label="Info image"
						name="info_image"
						note="Upload a photo of the nutritional information."
						type="file"
					/>
					<div className="formosa-field formosa-field--serving_size">
						<Label htmlFor="serving_size" label="Serving size" required />
						<div className="formosa-input-wrapper">
							<div className="flex">
								<Input disabled={servingSizeDisabled} name="serving_size" placeholder="eg. 1" required size={5} />
								<Input name="serving_units" placeholder="eg. cup" />
							</div>
							<div className="formosa-field__note">
								{row.id
									? 'Serving size cannot be changed because that would affect previous entries.'
									: 'Enter the serving size exactly as it appears on the package (eg. 1 package, 3/4 cups, 50 g).'}
							</div>
							<Error name="serving_size" />
							<Error name="serving_units" />
						</div>
					</div>
				</div>
			)}

			<h2>
				Nutrition facts
				<small>{` (per ${row.serving_size || ''} ${row.serving_units || 'serving'})`}</small>
			</h2>

			<div className={infoImageSrc ? '' : 'nutrition-facts--no-image'} id="nutrition-facts">
				{infoImageSrc && (
					<a
						href={infoImageLink}
						id="nutrition-facts__link"
						rel="noreferrer"
						ref={image}
						target="_blank"
					>
						<img
							alt="Nutrition facts"
							loading="lazy"
							src={infoImageSrc}
							width={300}
						/>
					</a>
				)}

				<div id="nutrition-facts__fields">
					<div className="nutrition-facts__list">
						{isVisible('calories') && <Field label="Calories" name="calories" {...attributes} />}
						{isVisible('fat') && <Field label="Fat" name="fat" suffix="g" {...attributes} />}
						<div className="nutrition-facts__section">
							{isVisible('saturated_fat') && <Field label="Saturated" name="saturated_fat" suffix="g" {...attributesSection} />}
							{isVisible('trans_fat') && <Field label="+ Trans" name="trans_fat" suffix="g" {...attributesSection} />}
							{isVisible('polyunsaturated_fat') && (
								<Field label="Polyunsaturated" name="polyunsaturated_fat" suffix="g" {...attributesSection} />
							)}
							{isVisible('omega_6') && <Field label="Omega-6" name="omega_6" suffix="g" {...attributesSection} />}
							{isVisible('omega_3') && <Field label="Omega-3" name="omega_3" suffix="g" {...attributesSection} />}
							{isVisible('monounsaturated_fat') && (
								<Field label="Monounsaturated" name="monounsaturated_fat" suffix="g" {...attributesSection} />
							)}
						</div>
						{isVisible('cholesterol') && <Field label="Cholesterol" name="cholesterol" suffix="mg" {...attributes} />}
						{isVisible('sodium') && <Field label="Sodium" name="sodium" suffix="mg" {...attributes} />}
						{isVisible('potassium') && <Field label="Potassium" name="potassium" suffix="mg" {...attributes} />}
						{isVisible('carbohydrate') && <Field label="Carbohydrate" name="carbohydrate" suffix="g" {...attributes} />}
						{(isVisible('fibre') || isVisible('sugars')) && (
							<div className="nutrition-facts__section">
								{isVisible('fibre') && <Field label="Fibre" name="fibre" suffix="g" {...attributesSection} />}
								{isVisible('sugars') && <Field label="Sugars" name="sugars" suffix="g" {...attributesSection} />}
							</div>
						)}
						{isVisible('protein') && <Field label="Protein" name="protein" suffix="g" {...attributes} />}
					</div>

					<div className="nutrition-facts__list" id="vitamins">
						{isVisible('vitamin_a') && <Field label="Vitamin A" name="vitamin_a" suffix="%" {...attributesVitamin} />}
						{isVisible('vitamin_c') && <Field label="Vitamin C" name="vitamin_c" suffix="%" {...attributesVitamin} />}
						{isVisible('calcium') && <Field label="Calcium" name="calcium" suffix="%" {...attributesVitamin} />}
						{isVisible('iron') && <Field label="Iron" name="iron" suffix="%" {...attributesVitamin} />}
						{isVisible('vitamin_d') && <Field label="Vitamin D" name="vitamin_d" suffix="%" {...attributesVitamin} />}
						{isVisible('vitamin_e') && <Field label="Vitamin E" name="vitamin_e" suffix="%" {...attributesVitamin} />}
						{isVisible('vitamin_k') && <Field label="Vitamin K" name="vitamin_k" suffix="%" {...attributesVitamin} />}
						{isVisible('thiamin') && <Field label="Thiamin" name="thiamin" suffix="%" {...attributesVitamin} />}
						{isVisible('riboflavin') && <Field label="Riboflavin" name="riboflavin" suffix="%" {...attributesVitamin} />}
						{isVisible('niacin') && <Field label="Niacin" name="niacin" suffix="%" {...attributesVitamin} />}
						{isVisible('vitamin_b6') && <Field label="Vitamin B6" name="vitamin_b6" suffix="%" {...attributesVitamin} />}
						{isVisible('folate') && <Field label="Folate" name="folate" suffix="%" {...attributesVitamin} />}
						{isVisible('vitamin_b12') && <Field label="Vitamin B12" name="vitamin_b12" suffix="%" {...attributesVitamin} />}
						{isVisible('biotin') && <Field label="Biotin" name="biotin" suffix="%" {...attributesVitamin} />}
						{isVisible('pantothenate') && <Field label="Pantothenate" name="pantothenate" suffix="%" {...attributesVitamin} />}
						{isVisible('phosphorus') && <Field label="Phosphorus" name="phosphorus" suffix="%" {...attributesVitamin} />}
						{isVisible('iodine') && <Field label="Iodine" name="iodine" suffix="%" {...attributesVitamin} />}
						{isVisible('magnesium') && <Field label="Magnesium" name="magnesium" suffix="%" {...attributesVitamin} />}
						{isVisible('zinc') && <Field label="Zinc" name="zinc" suffix="%" {...attributesVitamin} />}
						{isVisible('selenium') && <Field label="Selenium" name="selenium" suffix="%" {...attributesVitamin} />}
						{isVisible('copper') && <Field label="Copper" name="copper" suffix="%" {...attributesVitamin} />}
						{isVisible('manganese') && <Field label="Manganese" name="manganese" suffix="%" {...attributesVitamin} />}
						{isVisible('chromium') && <Field label="Chromium" name="chromium" suffix="%" {...attributesVitamin} />}
						{isVisible('molybdenum') && <Field label="Molybdenum" name="molybdenum" suffix="%" {...attributesVitamin} />}
						{isVisible('chloride') && <Field label="Chloride" name="chloride" suffix="%" {...attributesVitamin} />}
					</div>
				</div>
			</div>
		</>
	);
}

Fields.propTypes = {
	readOnly: PropTypes.bool,
	row: PropTypes.object,
};

Fields.defaultProps = {
	readOnly: false,
	row: null,
};
