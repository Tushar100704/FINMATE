import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SplashScreen } from './src/screens/auth/SplashScreen';
import { LandingScreen } from './src/screens/auth/LandingScreen';
import { PermissionsScreen } from './src/screens/auth/PermissionsScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { HomeScreen } from './src/screens/main/HomeScreen';
import { TransactionFeedScreen } from './src/screens/main/TransactionFeedScreen';
import { BudgetScreen } from './src/screens/main/BudgetScreen';
import { ProfileScreen } from './src/screens/main/ProfileScreen';
import { AddTransactionScreen } from './src/screens/transaction/AddTransactionScreen';
import { TransactionDetailScreen } from './src/screens/transaction/TransactionDetailScreen';
import { AddBudgetScreen } from './src/screens/budget/AddBudgetScreen';
import { SettingsScreen } from './src/screens/settings/SettingsScreen';
import { ExportDataScreen } from './src/screens/settings/ExportDataScreen';
import { ImportDataScreen } from './src/screens/settings/ImportDataScreen';
import { EditProfileScreen } from './src/screens/profile/EditProfileScreen';
import { BankAccountsScreen } from './src/screens/profile/BankAccountsScreen';
import { DarkModeScreen } from './src/screens/settings/DarkModeScreen';
import { NotificationsScreen } from './src/screens/settings/NotificationsScreen';
import { CurrencyScreen } from './src/screens/settings/CurrencyScreen';
import { FamilyHomeScreen } from './src/features/family/screens/FamilyHomeScreen';
import { CreateFamilyScreen } from './src/features/family/screens/CreateFamilyScreen';
import { JoinFamilyScreen } from './src/features/family/screens/JoinFamilyScreen';
import { FamilyAnalyticsScreen } from './src/features/family/screens/FamilyAnalyticsScreen';
import { initDatabase } from './src/services/database';
import { RootStackParamList, MainTabParamList } from './src/navigation/types';
import { Colors } from './src/constants/theme';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { CurrencyProvider } from './src/contexts/CurrencyContext';
import { Icon } from './src/components/ui/Icon';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          height: 60 + insets.bottom,
          backgroundColor: Colors.surface,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Feed" 
        component={TransactionFeedScreen}
        options={{
          tabBarLabel: 'Transactions',
          tabBarIcon: ({ color }) => <Icon name="list" size={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Budgets" 
        component={BudgetScreen}
        options={{
          tabBarLabel: 'Budgets',
          tabBarIcon: ({ color }) => <Icon name="wallet" size={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Family" 
        component={FamilyHomeScreen}
        options={{
          tabBarLabel: 'Family',
          tabBarIcon: ({ color }) => <Icon name="users" size={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Icon name="user" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing FinMate...');
      
      // Initialize database
      await initDatabase();
      console.log('✅ Database initialized');
      
      setIsReady(true);
    } catch (error) {
      console.error('❌ Initialization error:', error);
      setIsReady(true);
    }
  };

  if (!isReady) {
    return null; // Show nothing while initializing
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Permissions" component={PermissionsScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen 
            name="AddTransaction" 
            component={AddTransactionScreen}
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen 
            name="TransactionDetail" 
            component={TransactionDetailScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="AddBudget" 
            component={AddBudgetScreen}
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="ExportData" 
            component={ExportDataScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="ImportData" 
            component={ImportDataScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="BankAccounts" 
            component={BankAccountsScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="DarkMode" 
            component={DarkModeScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="Currency" 
            component={CurrencyScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="CreateFamily" 
            component={CreateFamilyScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="JoinFamily" 
            component={JoinFamilyScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="FamilyAnalytics" 
            component={FamilyAnalyticsScreen}
            options={{ 
              animation: 'slide_from_right',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
      </CurrencyProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
