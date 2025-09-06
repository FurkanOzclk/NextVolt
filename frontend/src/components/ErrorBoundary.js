import React from 'react';
import { View, Text } from 'react-native';
import { Button, Card } from 'react-native-paper';

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error) {
		// Hata durumunda state'i güncelle
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		// Hata detaylarını kaydet
		console.error('ErrorBoundary caught an error:', error, errorInfo);
		this.setState({
			error: error,
			errorInfo: errorInfo
		});
	}

	handleRetry = () => {
		this.setState({ hasError: false, error: null, errorInfo: null });
	};

	render() {
		if (this.state.hasError) {
			return (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' }}>
					<Card style={{ padding: 20, maxWidth: 300 }}>
						<Text variant="headlineSmall" style={{ color: '#ef4444', textAlign: 'center', marginBottom: 10 }}>
							Bir Hata Oluştu
						</Text>
						<Text style={{ textAlign: 'center', marginBottom: 20, color: '#64748b' }}>
							Uygulamada beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
						</Text>
						<Button mode="contained" onPress={this.handleRetry} style={{ marginBottom: 10 }}>
							Tekrar Dene
						</Button>
						{__DEV__ && (
							<View style={{ marginTop: 10, padding: 10, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
								<Text style={{ fontSize: 12, color: '#64748b' }}>
									Hata Detayı: {this.state.error?.message || 'Bilinmeyen hata'}
								</Text>
							</View>
						)}
					</Card>
				</View>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
