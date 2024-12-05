import { View, Text, Alert, SafeAreaView, StyleSheet, ActivityIndicator, 
    ScrollView, RefreshControl, TextInput, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';

const openWeatherKey = 'a3d3101be16f4fff3f8ec52489b5929f';
let url = `https://api.openweathermap.org/data/2.5/weather?appid=${openWeatherKey}&lang=pt_br&units=metric`;

const Weather = () => {
    const [forecast, setForecast] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [city, setCity] = useState(''); // Estado para armazenar o nome da cidade
    const [citySearch, setCitySearch] = useState(''); // Estado para armazenar a pesquisa

    const loadForecast = async () => {
        setRefreshing(true);

        if (citySearch) {
            // Se o nome da cidade for fornecido, faz a consulta usando o nome da cidade
            try {
                const response = await fetch(`${url}&q=${citySearch}`);
                const data = await response.json();

                if (!response.ok) {
                    Alert.alert('Erro', 'Cidade não encontrada.');
                } else {
                    setForecast(data); // Atualiza os dados com a resposta da pesquisa pela cidade
                }
            } catch (error) {
                Alert.alert('Erro', 'Ocorreu um problema ao buscar os dados.');
                console.error(error);
            } finally {
                setRefreshing(false);
            }
        } else {
            // Caso não tenha cidade, solicita a localização atual
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão para acesso da localização foi negado');
                setRefreshing(false);
                return;
            }

            try {
                const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
                const response = await fetch(`${url}&lat=${location.coords.latitude}&lon=${location.coords.longitude}`);
                const data = await response.json();

                if (!response.ok) {
                    Alert.alert('Erro', 'Não foi possível carregar os dados do clima atual');
                } else {
                    setForecast(data); // Atualiza os dados com a resposta da localização
                }
            } catch (error) {
                Alert.alert('Erro', 'Ocorreu um problema ao buscar os dados.');
                console.error(error);
            } finally {
                setRefreshing(false);
            }
        }
    };

    useEffect(() => {
        loadForecast();
    }, []); // Carrega a previsão inicial ao montar o componente

    if (!forecast || !forecast.weather || !forecast.main) {
        return (
            <SafeAreaView style={styles.loading}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    const currentWeather = forecast.weather[0];
    const { temp, humidity } = forecast.main;
    const cityName = forecast.name;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={loadForecast}
                    />
                }
                style={{ marginTop: 50 }}
            >
                <Text style={styles.title}>Tempo Atual</Text>

                {/* Campo de pesquisa de cidade */}
                <TextInput
                    style={styles.input}
                    placeholder="Digite o nome da cidade"
                    value={citySearch}
                    onChangeText={setCitySearch}
                />
                <Button title="Pesquisar" onPress={loadForecast} />

                <Text style={{ textAlign: 'center', color: '#000', marginTop: 10 }}>
                    {citySearch ? `Localização Pesquisada: ${citySearch}` : `Sua Localização: ${cityName}`}
                </Text>

                <View>
                    <Text style={{ color: '#000', paddingLeft: 20, marginTop: 10 }}>Condição: {currentWeather.description}</Text>
                    <Text style={{ color: '#000', paddingLeft: 20 }}>Temperatura: {temp}°C</Text>
                    <Text style={{ color: '#000', paddingLeft: 20 }}>Umidade: {humidity}%</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Weather;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ECDBBA',
    },
    title: {
        textAlign: 'center',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#C84B31',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        margin: 10,
        paddingLeft: 10,
    },
});
