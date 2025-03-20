// components/platform/Map.web.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// This is a simplified web fallback
const Map = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Maps are only available on mobile devices</Text>
      <Text style={styles.subtext}>Please run this app on iOS or Android</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default Map;