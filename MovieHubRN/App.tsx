/**
 * MovieHub React Native App
 * Complete movie discovery application
 *
 * @format
 */

import React from 'react';
import {StatusBar, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider} from './src/context/AuthContext';
import {WishlistProvider} from './src/context/WishlistContext';
import AppNavigator from './src/navigation/AppNavigator';
import {colors} from './src/utils/theme';

const App = () => {
  return (
    <View style={{flex: 1}}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
        />
        <AuthProvider>
          <WishlistProvider>
            <AppNavigator />
          </WishlistProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </View>
  );
};

export default App;
