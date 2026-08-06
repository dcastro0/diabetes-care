import { Feather } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

export function HelloWave() {
  return (
    <View style={{ marginTop: -2 }}>
      <Feather name="activity" size={24} color="#0EA5E9" />
    </View>
  );
}
