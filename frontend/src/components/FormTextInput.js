import React, { useState } from 'react';
import { TextInput, HelperText } from 'react-native-paper';

export default function FormTextInput({
	label,
	value,
	onChangeText,
	icon,
	keyboardType,
	secure,
	error,
	helperText,
	style,
	...rest
}) {
	const [show, setShow] = useState(false);
	const isSecure = !!secure && !show;

	return (
		<>
			<TextInput
				mode="outlined"
				label={label}
				value={value}
				onChangeText={onChangeText}
				keyboardType={keyboardType}
				secureTextEntry={isSecure}
				left={icon ? <TextInput.Icon icon={icon} /> : undefined}
				right={secure ? <TextInput.Icon icon={show ? 'eye-off' : 'eye'} onPress={() => setShow(!show)} /> : undefined}
				dense
				style={[{ marginBottom: 6 }, style]}
				outlineStyle={{ borderRadius: 12 }}
				theme={{ colors: { primary: '#7c3aed' } }}
				error={!!error}
				{...rest}
			/>
			{helperText ? (
				<HelperText type={error ? 'error' : 'info'}>{helperText}</HelperText>
			) : null}
		</>
	);
} 