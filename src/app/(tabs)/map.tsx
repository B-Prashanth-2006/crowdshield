import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useIncidentStore } from '@/store/incident';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { MapPin, Search, Filter, AlertTriangle, ShieldCheck } from 'lucide-react-native';

// Try importing MapView, with fallback for web
let MapView: any;
let Marker: any;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
} catch (e) {
  MapView = null;
  Marker = null;
}

const CATEGORIES = ['All', 'Fire', 'Medical', 'Threat/Crime', 'Accident', 'Disaster', 'Other'];
const URGENCY_LEVELS = ['All', 'Low', 'Medium', 'High', 'Critical'];

export default function AlertsMapScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { incidents } = useIncidentStore();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter incidents
  const filteredIncidents = incidents.filter((inc) => {
    const matchesCategory = selectedCategory === 'All' || inc.category === selectedCategory;
    const matchesUrgency = selectedUrgency === 'All' || inc.urgency === selectedUrgency;
    const matchesSearch =
      searchQuery === '' ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inc.location_name && inc.location_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Display submitted, verified, under-review or resolved incidents
    const isPublicStatus = inc.status === 'Submitted' || inc.status === 'Verified' || inc.status === 'Under Review' || inc.status === 'Resolved';
    
    return matchesCategory && matchesUrgency && matchesSearch && isPublicStatus;
  });

  const getSeverityColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return theme.danger;
      case 'High': return theme.warning;
      case 'Medium': return theme.primary;
      default: return theme.success;
    }
  };

  const getUrgencyLightColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return theme.dangerLight;
      case 'High': return theme.warningLight;
      case 'Medium': return theme.primaryLight;
      default: return theme.successLight;
    }
  };

  const renderIncidentCard = ({ item }: { item: any }) => {
    const pinColor = getSeverityColor(item.urgency);
    const lightBg = getUrgencyLightColor(item.urgency);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/report/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.indicatorPin, { backgroundColor: pinColor }]} />
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.location_name || 'Safety Report'}
          </Text>
          <Text style={styles.cardTime}>
            {new Date(item.incident_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={[styles.badge, { backgroundColor: lightBg }]}>
            <Text style={[styles.badgeText, { color: pinColor }]}>{item.category}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: lightBg }]}>
            <Text style={[styles.badgeText, { color: pinColor }]}>{item.urgency}</Text>
          </View>
          <Text style={styles.cardStatus}>{item.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: Spacing.three,
      marginHorizontal: Spacing.four,
      marginVertical: Spacing.two,
      height: 48,
    },
    searchInput: {
      flex: 1,
      color: theme.text,
      marginLeft: Spacing.two,
      fontSize: 15,
    },
    filterScroll: {
      paddingHorizontal: Spacing.four,
      paddingBottom: Spacing.two,
      height: 40,
    },
    filterContainer: {
      flexDirection: 'row',
      gap: Spacing.two,
    },
    filterPill: {
      paddingHorizontal: Spacing.three,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
    },
    filterPillText: {
      fontSize: 12,
      fontWeight: '700',
    },
    mapContainer: {
      flex: 1,
      backgroundColor: theme.backgroundSelected,
      minHeight: 250,
    },
    webMapPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.five,
    },
    webMapTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      marginTop: Spacing.two,
    },
    webMapDesc: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.one,
    },
    feedContainer: {
      height: '35%',
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    feedHeader: {
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.three,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    feedTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.text,
      textTransform: 'uppercase',
    },
    feedCount: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    cardList: {
      padding: Spacing.three,
    },
    card: {
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: Spacing.three,
      marginBottom: Spacing.three,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.one,
    },
    indicatorPin: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: Spacing.two,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
      flex: 1,
    },
    cardTime: {
      fontSize: 11,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    cardDesc: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 18,
      marginVertical: Spacing.two,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    badge: {
      paddingHorizontal: Spacing.two,
      paddingVertical: 3,
      borderRadius: 4,
    },
    badgeText: {
      fontSize: 9,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    cardStatus: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textSecondary,
      marginLeft: 'auto',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search size={20} color={theme.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by keywords or address..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter bar */}
      <View style={{ height: 44 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterPill,
                {
                  backgroundColor: selectedCategory === item ? theme.primary : theme.backgroundElement,
                  borderColor: selectedCategory === item ? theme.primary : theme.border,
                  marginRight: Spacing.two,
                },
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: selectedCategory === item ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Map Content View */}
      <View style={styles.mapContainer}>
        {MapView && Platform.OS !== 'web' ? (
          <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={{
              latitude: 37.7793,
              longitude: -122.4192,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
          >
            {filteredIncidents.map((marker) => (
              <Marker
                key={marker.id}
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                title={marker.location_name}
                description={marker.category}
                pinColor={getSeverityColor(marker.urgency)}
                onCalloutPress={() => router.push(`/report/${marker.id}`)}
              />
            ))}
          </MapView>
        ) : (
          <View style={styles.webMapPlaceholder}>
            <MapPin size={48} color={theme.primary} />
            <Text style={styles.webMapTitle}>Interactive Safety Map</Text>
            <Text style={styles.webMapDesc}>
              Showing {filteredIncidents.length} active warnings coordinates in San Francisco.
            </Text>
            <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three }}>
              {filteredIncidents.slice(0, 3).map((item) => (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: theme.backgroundElement,
                    borderWidth: 1,
                    borderColor: getSeverityColor(item.urgency),
                    borderRadius: 8,
                    padding: 8,
                    width: 100,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '700', color: theme.text }} numberOfLines={1}>
                    {item.location_name}
                  </Text>
                  <Text style={{ fontSize: 9, color: getSeverityColor(item.urgency) }}>{item.category}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Feed list below */}
      <View style={styles.feedContainer}>
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Safety Warnings</Text>
          <Text style={styles.feedCount}>{filteredIncidents.length} reports</Text>
        </View>

        <FlatList
          data={filteredIncidents}
          keyExtractor={(item) => item.id}
          renderItem={renderIncidentCard}
          contentContainerStyle={styles.cardList}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: Spacing.five }}>
              <ShieldCheck size={36} color={theme.success} />
              <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text, marginTop: Spacing.two }}>
                No threats found
              </Text>
              <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: Spacing.one }}>
                No active safety warnings match your filter.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
