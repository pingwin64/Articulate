import React from 'react';
import { Appearance, StyleSheet, View, Text, Pressable } from 'react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      const isDark = Appearance.getColorScheme() === 'dark';
      const bg = isDark ? '#000000' : '#ffffff';
      const fg = isDark ? '#ffffff' : '#000000';
      const muted = isDark ? '#999999' : '#666666';

      return (
        <View style={[styles.container, { backgroundColor: bg }]}>
          <Text style={[styles.title, { color: fg }]}>Something went wrong</Text>
          <Text style={[styles.subtitle, { color: muted }]}>
            An unexpected error occurred. Please try again.
          </Text>
          <Pressable onPress={this.handleRetry} style={[styles.button, { borderColor: fg }]}>
            <Text style={[styles.buttonText, { color: fg }]}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
