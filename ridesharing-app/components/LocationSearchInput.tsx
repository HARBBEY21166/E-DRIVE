// ridesharing-app/components/LocationSearchInput.tsx

import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';

interface Place {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface LocationSearchInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onPlaceSelect: (place: Place) => void;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({ label, placeholder, value, onChangeText, onPlaceSelect }) => {

  const handleSubmitEditing = () => {
    // Here we simulate a selected place. Replace this with actual logic to send back a selected place.
    const selectedPlace: Place = {
      id: '1', // Dummy id for illustration
      name: value,
      address: '123 Example St', // Dummy address
      coordinates: {
        latitude: 0, // Replace with actual latitude
        longitude: 0, // Replace with actual longitude
      },
    };

    // Call the onPlaceSelect with a structured place object
    onPlaceSelect(selectedPlace);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmitEditing}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
});

export default LocationSearchInput;