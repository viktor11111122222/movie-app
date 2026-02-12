import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, fonts } from '../utils/theme';

const StreamingProviders = ({ providers }) => {
  if (!providers || !providers.US) {
    return null;
  }

  const { flatrate, rent, buy } = providers.US;

  const renderProviderList = (list, title) => {
    if (!list || list.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {list.map((provider) => (
            <View key={provider.provider_id} style={styles.providerItem}>
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/original${provider.logo_path}` }}
                style={styles.providerLogo}
              />
              <Text style={styles.providerName}>{provider.provider_name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where to Watch</Text>
      {renderProviderList(flatrate, 'Stream')}
      {renderProviderList(rent, 'Rent')}
      {renderProviderList(buy, 'Buy')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  title: {
    fontSize: fonts.sizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  providerItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 60,
  },
  providerLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  providerName: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default StreamingProviders;
