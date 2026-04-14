import { useLanguage } from '@/context/LanguageContext';
import React, { useEffect, useState } from 'react';
import { Button, DevSettings, ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = { children?: React.ReactNode };
type State = { error: Error | null; info: any | null };

type BoundaryLabels = {
  title: string;
  reload: string;
};

class ErrorBoundaryInner extends React.Component<Props & { labels: BoundaryLabels }, State> {
  constructor(props: Props & { labels: BoundaryLabels }) {
    super(props);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error: Error, info: any) {
    // Save error info to state so we can show it in the UI
    this.setState({ error, info });
    // Also log it to console
     
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children as any;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{this.props.labels.title}</Text>
        <Text style={styles.message}>{error?.message}</Text>
        <ScrollView style={styles.stack}>
          <Text style={styles.stackText}>{(info && info.componentStack) || String(error)}</Text>
        </ScrollView>
        <View style={styles.buttons}>
          <Button title={this.props.labels.reload} onPress={() => DevSettings.reload()} />
        </View>
      </View>
    );
  }
}

export default function ErrorBoundary(props: Props) {
  const { translate } = useLanguage();
  const [labels, setLabels] = useState<BoundaryLabels>({
    title: 'Error',
    reload: 'Refresh',
  });

  useEffect(() => {
    (async () => {
      setLabels({
        title: await translate('Error'),
        reload: await translate('Refresh'),
      });
    })();
  }, [translate]);

  return <ErrorBoundaryInner {...props} labels={labels} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff4f4' },
  title: { fontSize: 20, fontWeight: '700', color: '#a00', marginBottom: 8 },
  message: { color: '#600', marginBottom: 12 },
  stack: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 10 },
  stackText: { color: '#333', fontFamily: undefined },
  buttons: { marginTop: 12 },
});
