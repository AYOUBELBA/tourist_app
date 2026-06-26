import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { db } from '../database/database';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [cities, setCities] = useState([]);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM cities');
      setCities(result);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back, {user?.name || 'Traveler'}! 👋</Text>
        <Text style={styles.subtitle}>Where would you like to go today?</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Destinations</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.citiesScroll}>
          {cities.map((city: any) => (
            <TouchableOpacity
              key={city.id}
              style={styles.cityCard}
              onPress={() => navigation.navigate('CityDetails', { city })}
            >
              <Image source={{ uri: city.image }} style={styles.cityImage} />
              <View style={styles.cityInfo}>
                <Text style={styles.cityName}>{city.name}</Text>
                <Text style={styles.cityRegion}>{city.region}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.exploreButton}>
        <Text style={styles.exploreButtonText}>Start Exploring →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#0EA5E9',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#E0F2FE',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 15,
  },
  citiesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  cityCard: {
    width: 200,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityImage: {
    width: '100%',
    height: 150,
  },
  cityInfo: {
    padding: 12,
  },
  cityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  cityRegion: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  exploreButton: {
    margin: 20,
    backgroundColor: '#0EA5E9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});