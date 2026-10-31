import React from 'react';
import { Redirect } from 'expo-router';
import { useApp } from '../src/store/AppProvider';

export default function Index() {
  const { state } = useApp();
  return <Redirect href={state.program ? '/(tabs)' : '/onboarding'} />;
}
