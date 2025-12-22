
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function ClubsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS === 'android' && styles.androidPadding,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Clubs</Text>
          <Text style={styles.subtitle}>Join the community</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={[buttonStyles.primary, styles.createButton]}>
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add-circle"
              size={24}
              color={colors.text}
            />
            <Text style={[buttonStyles.text, styles.createButtonText]}>
              Create Club
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={24}
              color={colors.accent}
            />
            <Text style={styles.sectionTitle}>My Clubs</Text>
          </View>
          <View style={commonStyles.emptyState}>
            <IconSymbol
              ios_icon_name="person.3.fill"
              android_material_icon_name="groups"
              size={64}
              color={colors.textSecondary}
              style={{ opacity: 0.5 }}
            />
            <Text style={commonStyles.emptyStateText}>
              You haven&apos;t joined any clubs yet
            </Text>
            <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
              Discover clubs below or create your own
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="sparkles"
              android_material_icon_name="explore"
              size={24}
              color={colors.secondary}
            />
            <Text style={styles.sectionTitle}>Discover Clubs</Text>
          </View>
          <View style={commonStyles.emptyState}>
            <IconSymbol
              ios_icon_name="magnifyingglass"
              android_material_icon_name="search"
              size={48}
              color={colors.textSecondary}
              style={{ opacity: 0.5 }}
            />
            <Text style={commonStyles.emptyStateText}>
              No clubs available yet
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  androidPadding: {
    paddingTop: 48,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonText: {
    marginLeft: 0,
  },
});
