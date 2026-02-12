import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../utils/theme';

const VideoPlayer = ({ videoKey, onClose }) => {
  const [loading, setLoading] = useState(true);

  if (!videoKey) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Video not available</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    );
  }

  const videoUrl = `https://www.youtube.com/embed/${videoKey}`;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="close" size={24} color={colors.white} />
      </TouchableOpacity>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      
      <WebView
        source={{ uri: videoUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  webview: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: spacing.sm,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  errorText: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default VideoPlayer;
