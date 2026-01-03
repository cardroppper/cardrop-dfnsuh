
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { autoDebugger } from '@/utils/autoDebugger';
import { navigationDebugger } from '@/utils/navigationDebugger';
import { colors } from '@/styles/commonStyles';
import * as Network from 'expo-network';

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export function DebugPanel({ visible, onClose }: DebugPanelProps) {
  const [healthSummary, setHealthSummary] = useState('');
  const [navReport, setNavReport] = useState('');
  const [networkInfo, setNetworkInfo] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadDebugInfo = async () => {
    setRefreshing(true);
    
    try {
      // Get health summary
      const health = await autoDebugger.getHealthSummary();
      setHealthSummary(health);

      // Get navigation report
      const nav = navigationDebugger.generateReport();
      setNavReport(nav);

      // Get network info
      const networkState = await Network.getNetworkStateAsync();
      const networkDetails = `Network Status:
Connected: ${networkState.isConnected ? '✅' : '❌'}
Internet Reachable: ${networkState.isInternetReachable ? '✅' : '❌'}
Type: ${networkState.type}`;
      setNetworkInfo(networkDetails);
    } catch (error) {
      console.error('Error loading debug info:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadDebugInfo();
    }
  }, [visible]);

  const handleClearLogs = () => {
    Alert.alert(
      'Clear Debug Logs',
      'Are you sure you want to clear all debug logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            autoDebugger.clear();
            navigationDebugger.clear();
            loadDebugInfo();
            Alert.alert('Success', 'Debug logs cleared');
          },
        },
      ]
    );
  };

  const handleExportLogs = () => {
    const logs = `
=== CarDrop Debug Export ===
Timestamp: ${new Date().toISOString()}

${healthSummary}

${navReport}

${networkInfo}

===========================
    `.trim();

    console.log(logs);
    Alert.alert('Logs Exported', 'Debug logs have been printed to console');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🔧 Debug Panel</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Health</Text>
            <View style={styles.card}>
              <Text style={styles.monospace}>{healthSummary}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Network Status</Text>
            <View style={styles.card}>
              <Text style={styles.monospace}>{networkInfo}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Navigation Report</Text>
            <View style={styles.card}>
              <Text style={styles.monospace}>{navReport}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={loadDebugInfo}
              disabled={refreshing}
            >
              <Text style={styles.actionButtonText}>
                {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.warningButton]}
              onPress={handleClearLogs}
            >
              <Text style={styles.actionButtonText}>🗑️ Clear Logs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleExportLogs}
            >
              <Text style={styles.actionButtonText}>📤 Export to Console</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips</Text>
            <View style={styles.card}>
              <Text style={styles.tipText}>
                • If operations are timing out, check your network connection
              </Text>
              <Text style={styles.tipText}>
                • High failure rates may indicate backend issues
              </Text>
              <Text style={styles.tipText}>
                • Stuck navigations suggest UI state management problems
              </Text>
              <Text style={styles.tipText}>
                • Export logs to console for detailed analysis
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monospace: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  warningButton: {
    borderColor: '#ff9500',
  },
  primaryButton: {
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
});
