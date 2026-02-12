import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar, View, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import {WishlistProvider} from './src/context/WishlistContext';
import {AppNavigator} from './src/navigation/AppNavigator';
import SplashScreen from 'react-native-splash-screen';

const AppContent = () => {
  const {isAuthenticated, isLoading} = useAuth();

  useEffect(() => {
    if (!isLoading && SplashScreen) {
      SplashScreen.hide();
    }
  }, [isLoading]);

  if (isLoading) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#000"
        translucent
      />
      <AppNavigator isAuthenticated={isAuthenticated} />
    </>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <AuthProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </AuthProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
});

export default App;
